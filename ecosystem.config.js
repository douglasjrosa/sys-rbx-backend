module.exports = {
	apps: [
		{
			name: 'strapi_vendas',
			script: 'npm',
			args: 'run start',
			autorestart: true,
			watch: false,
			max_memory_restart: '1G',
		},
	],
}