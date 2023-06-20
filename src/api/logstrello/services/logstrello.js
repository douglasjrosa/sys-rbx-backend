'use strict';

/**
 * logstrello service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::logstrello.logstrello');
