module.exports = {
    apps: [
        {
            name: 'CitizenOne App',
            port: '3001',
            exec_mode: 'cluster',
            instances: 1,
            script: './.output/server/index.mjs',
            args: 'start'
        }
    ]
}