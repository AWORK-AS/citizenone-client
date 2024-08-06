module.exports = {
    apps: [
        {
            name: 'CitizenOne App',
            exec_mode: 'cluster',
            instances: 1,
            script: './.output/server/index.mjs',
            args: 'start'
        }
    ]
}