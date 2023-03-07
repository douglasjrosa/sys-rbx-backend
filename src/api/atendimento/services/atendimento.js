'use strict';

/**
 * atendimento service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::atendimento.atendimento');
