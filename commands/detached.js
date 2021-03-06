'use strict'

let co = require('co')
let cli = require('heroku-cli-util')
let helpers = require('../lib/helpers')
let logDisplayer = require('../lib/log_displayer')
let Dyno = require('../lib/dyno')

function * run (context, heroku) {
  let opts = {
    heroku: heroku,
    app: context.app,
    command: helpers.buildCommand(context.args),
    size: context.flags.size,
    env: context.flags.env,
    attach: false
  }
  if (!opts.command) throw new Error('Usage: heroku run COMMAND\n\nExample: heroku run bash')
  let dyno = new Dyno(opts)
  yield dyno.start()

  if (context.flags.tail) {
    yield logDisplayer(heroku, {
      app: context.app,
      dyno: dyno.dyno.name,
      tail: true
    })
  } else {
    cli.log(`Run ${cli.color.cmd('heroku logs --app ' + dyno.opts.app + ' --dyno ' + dyno.dyno.name)} to view the output.`)
  }
}

module.exports = {
  topic: 'run',
  command: 'detached',
  description: 'run a detached dyno, where output is sent to your logs',
  help: `
Example:

  $ heroku run:detached ls
  Running ls on app [detached]... up, run.1
  Run heroku logs -a app -p run.1 to view the output.
`,
  variableArgs: true,
  needsAuth: true,
  needsApp: true,
  flags: [
    {name: 'size', char: 's', description: 'dyno size', hasValue: true},
    {name: 'tail', char: 't', description: 'stream logs from the dyno'},
    {name: 'env', char: 'e', description: "environment variables to set (use ';' to split multiple vars)", hasValue: true}
  ],
  run: cli.command(co.wrap(run))
}
