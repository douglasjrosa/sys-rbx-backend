'use strict';

/**
 * bt-status service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::bt-status.bt-status');
