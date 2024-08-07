module.exports = {
    apps: [
        {
            name: 'CitizenOne Client',
            port: '3000',
            exec_mode: 'cluster',
            instances: 1,
            script: './.output/server/index.mjs',
            args: 'start'
        }
    ]
}