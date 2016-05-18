'use strict'
/* globals describe beforeEach it commands apikey */

const cli = require('heroku-cli-util')
const cmd = commands.find(c => c.topic === 'run' && !c.command)
const expect = require('unexpected')
const StdOutFixture = require('fixture-stdout')

describe('run', () => {
  beforeEach(() => cli.mockConsole())

  it('runs a command', () => {
    let stdout = ''
    let fixture = new StdOutFixture()
    fixture.capture(s => { stdout += s })
    return cmd.run({app: 'heroku-run-test-app', flags: {}, auth: {password: apikey}, args: ['echo', '1', '2', '3']})
    .then(() => fixture.release())
    .then(() => expect(stdout, 'to equal', '1 2 3\n'))
  })

  it('runs a command with env vars', () => {
    let stdout = ''
    let fixture = new StdOutFixture()
    fixture.capture(s => { stdout += s })
    return cmd.run({app: 'heroku-run-test-app', flags: {env: 'FOO=bar'}, auth: {password: apikey}, args: ['env']})
    .then(() => fixture.release())
    .then(() => expect(stdout, 'to contain', 'FOO=bar'))
  })

  it('gets 127 status for invalid command', () => {
    return expect(cmd.run({app: 'heroku-run-test-app', flags: {'exit-code': true}, auth: {password: apikey}, args: ['invalid-command']})
                  , 'to be rejected with', 'Process exited with code 127')
  })
})
