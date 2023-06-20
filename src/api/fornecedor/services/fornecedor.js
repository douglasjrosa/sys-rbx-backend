'use strict';

/**
 * fornecedor service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::fornecedor.fornecedor');
