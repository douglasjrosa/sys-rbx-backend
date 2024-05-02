'use strict';

/**
 * log-empresa service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::log-empresa.log-empresa');
