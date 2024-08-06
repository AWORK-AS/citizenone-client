module.exports = {
    apps: [
        {
            name: 'CitizenOne Client',
            exec_mode: 'cluster',
            instances: 1,
            script: './.output/server/index.mjs',
            args: 'start'
        }
    ]
}