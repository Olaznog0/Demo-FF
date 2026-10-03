import type { Handler } from "@netlify/functions";
import { json } from "./_shared/http";
import { withClient, placeId as selectedPlaceId, currentClient } from "../../integration-context.js";
import {googleApiKey} from '../../google-business.js';

type GoogleReview = {
  authorAttribution?: { displayName?: string; photoUri?: string; uri?: string };
  googleMapsUri?: string;
  rating?: number;
  text?: { text?: string; languageCode?: string };
  originalText?: { text?: string; languageCode?: string };
  relativePublishTimeDescription?: string;
  publishTime?: string;
};

type GooglePlaceDetailsResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: GoogleReview[];
};

type Review = {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string;
  language?: string;
  originalText?: string;
  originalLanguage?: string;
  profilePhotoUrl?: string;
  authorUri?: string;
  googleMapsUri?: string;
  time?: number;
};

type ReviewsResponse = {
  rating: number;
  total: number;
  url?: string;
  reviews: Review[];
};

type CacheEntry = {
  expiresAt: number;
  payload: ReviewsResponse;
};

const CACHE_TTL_MS = 48 * 60 * 60 * 1000;
const REVIEW_FILTER_VERSION = "v2";
const MAX_REVIEWS = 5;
const cache = new Map<string, CacheEntry>();

function getLanguage(rawLang: string | undefined) {
  if (rawLang && /^[a-z]{2,3}(?:-[A-Z]{2})?$/.test(rawLang)) return rawLang;
  return process.env.GOOGLE_PLACES_LANGUAGE || "nl";
}

function getSourceLanguages() {
  return (process.env.GOOGLE_PLACES_SOURCE_LANGUAGES || currentClient()?.languages?.join(",") || "nl,en")
    .split(",")
    .map((language) => language.trim())
    .filter(Boolean);
}

function getCacheKey(language: string, placeId: string) {
  const sourceLanguages = getSourceLanguages().join(",");
  const translationEnabled = googleApiKey(currentClient(),'GOOGLE_TRANSLATE_API_KEY') ? "translated" : "raw";
  return `${placeId}:${language}:${sourceLanguages}:${translationEnabled}:${REVIEW_FILTER_VERSION}:${MAX_REVIEWS}`;
}

function looksLikeApiKey(value: string | undefined) {
  return Boolean(value?.startsWith("AIza"));
}

function looksLikeSyntheticReview(review: Review) {
  const text = (review.originalText || review.text).toLowerCase();
  const syntheticPatterns = [
    /here are ten positive reviews/,
    /here are \d+ positive reviews/,
    /specifically focused on their/,
    /write (?:a|an|some) positive reviews/,
  ];

  return syntheticPatterns.some((pattern) => pattern.test(text));
}

function formatRelativeTime(time: number | undefined, language: string) {
  if (!time) return undefined;

  const now = Date.now();
  const diffMs = time * 1000 - now;
  const absDiffMs = Math.abs(diffMs);
  const divisions = [
    { amount: 60, unit: "second" as const },
    { amount: 60, unit: "minute" as const },
    { amount: 24, unit: "hour" as const },
    { amount: 30, unit: "day" as const },
    { amount: 12, unit: "month" as const },
    { amount: Number.POSITIVE_INFINITY, unit: "year" as const },
  ];

  let duration = absDiffMs / 1000;
  for (const division of divisions) {
    if (duration < division.amount) {
      const value = Math.round(duration) * Math.sign(diffMs);
      return new Intl.RelativeTimeFormat(language, { numeric: "auto" }).format(value, division.unit);
    }
    duration /= division.amount;
  }

  return undefined;
}

function normalizeReview(review: GoogleReview): Review | null {
  const authorName = review.authorAttribution?.displayName?.trim();
  const rating = review.rating;
  const text = review.text?.text?.trim();
  const relativeTime = review.relativePublishTimeDescription?.trim();

  if (!authorName || typeof rating !== "number" || !text || !relativeTime) return null;

  const publishTime = review.publishTime ? Date.parse(review.publishTime) : Number.NaN;

  return {
    authorName,
    rating,
    text,
    relativeTime,
    language: review.text?.languageCode,
    originalText: review.originalText?.text?.trim(),
    originalLanguage: review.originalText?.languageCode,
    profilePhotoUrl: review.authorAttribution?.photoUri,
    authorUri: review.authorAttribution?.uri,
    googleMapsUri: review.googleMapsUri,
    time: Number.isNaN(publishTime) ? undefined : Math.floor(publishTime / 1000),
  };
}

function normalizeResponse(place: GooglePlaceDetailsResponse): ReviewsResponse {
  return {
    rating: typeof place.rating === "number" ? place.rating : 0,
    total: typeof place.userRatingCount === "number" ? place.userRatingCount : 0,
    url: place.googleMapsUri,
    reviews: (place.reviews || [])
      .map(normalizeReview)
      .filter((review): review is Review => review !== null)
      .filter((review) => !looksLikeSyntheticReview(review))
      .slice(0, MAX_REVIEWS),
  };
}

function mergePlaces(places: GooglePlaceDetailsResponse[]) {
  const primary = places[0] || {};
  const mergedReviews = new Map<string, GoogleReview>();

  for (const place of places) {
    for (const review of place.reviews || []) {
      const key = `${review.authorAttribution?.displayName || ""}-${review.publishTime || ""}`;
      if (!mergedReviews.has(key)) mergedReviews.set(key, review);
    }
  }

  return {
    ...primary,
    reviews: Array.from(mergedReviews.values()),
  };
}

async function fetchPlace(apiKey: string, placeId: string, language: string) {
  const response = await fetch(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?languageCode=${encodeURIComponent(language)}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "rating,userRatingCount,googleMapsUri,reviews.authorAttribution,reviews.googleMapsUri,reviews.rating,reviews.text,reviews.originalText,reviews.relativePublishTimeDescription,reviews.publishTime",
      },
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) throw new Error(`Google Places returned ${response.status}`);
  return (await response.json()) as GooglePlaceDetailsResponse;
}

async function translateReviews(payload: ReviewsResponse, targetLanguage: string) {
  // Prefer the original when it is already in the requested language. Never translate an already translated result again.
  payload = { ...payload, reviews: payload.reviews.map(review => review.originalLanguage === targetLanguage && review.originalText
    ? { ...review, text: review.originalText, language: targetLanguage } : review) };
  const apiKey = googleApiKey(currentClient(),'GOOGLE_TRANSLATE_API_KEY');
  if (!apiKey) {
    return {
      ...payload,
      reviews: payload.reviews.map((review) => ({
        ...review,
        relativeTime: formatRelativeTime(review.time, targetLanguage) || review.relativeTime,
      })),
    };
  }

  const indexesToTranslate = payload.reviews
    .map((review, index) => ({ review, index }))
    .filter(({ review }) => review.originalText && review.originalLanguage && review.originalLanguage !== targetLanguage && review.language !== targetLanguage);

  if (indexesToTranslate.length === 0) {
    return {
      ...payload,
      reviews: payload.reviews.map((review) => ({
        ...review,
        relativeTime: formatRelativeTime(review.time, targetLanguage) || review.relativeTime,
      })),
    };
  }

  const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: indexesToTranslate.map(({ review }) => review.originalText),
      target: targetLanguage,
      format: "text",
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`Google Translate returned ${response.status}`);

  const result = (await response.json()) as { data?: { translations?: Array<{ translatedText?: string }> } };
  const translatedReviews = [...payload.reviews];

  indexesToTranslate.forEach(({ index }, translationIndex) => {
    const translatedText = result.data?.translations?.[translationIndex]?.translatedText;
    if (translatedText) {
      translatedReviews[index] = { ...translatedReviews[index], text: translatedText, language: targetLanguage };
    }
  });

  return {
    ...payload,
    reviews: translatedReviews.map((review) => ({
      ...review,
      relativeTime: formatRelativeTime(review.time, targetLanguage) || review.relativeTime,
    })),
  };
}

function cachedResponse(payload: ReviewsResponse) {
  return {
    ...json(200, payload as unknown as Record<string, unknown>),
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, s-maxage=172800",
    },
  };
}

const originalHandler: Handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Method not allowed" });

  const apiKey = googleApiKey(currentClient());
  let placeId:string;try{placeId=await selectedPlaceId();}catch{return json(503,{error:'reviews_unavailable'});}
  const language = getLanguage(event.queryStringParameters?.lang);

  if (!apiKey || !placeId) {
    console.error("Google reviews configuration missing", {
      hasApiKey: Boolean(apiKey),
      hasPlaceId: Boolean(placeId),
    });
    return json(503, { error: "reviews_unavailable" });
  }

  if (looksLikeApiKey(placeId)) {
    console.error("Google reviews configuration invalid", {
      reason: "GOOGLE_PLACE_ID looks like an API key, not a Google Place ID",
    });
    return json(503, { error: "reviews_unavailable" });
  }

  const cacheKey = getCacheKey(language, placeId);
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cachedResponse(cached.payload);

  try {
    const sources = [...new Set([language, ...getSourceLanguages()])];
    const places = await Promise.all(sources.map((sourceLanguage) => fetchPlace(apiKey, placeId, sourceLanguage)));
    const mergedPlace = mergePlaces(places);
    const payload = await translateReviews(normalizeResponse(mergedPlace), language);
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, payload });
    return cachedResponse(payload);
  } catch (error) {
    console.error("Google reviews request failed", error);
    return json(503, { error: "reviews_unavailable" });
  }
};
export const handler: Handler = withClient(originalHandler, "reviews");
