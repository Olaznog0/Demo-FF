'use strict';
require('./build-showcase.js').build().catch(error=>{console.error(error.message);process.exitCode=1;});
