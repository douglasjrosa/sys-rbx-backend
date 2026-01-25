'use strict';

/**
 * prazo-pg service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::prazo-pg.prazo-pg');
