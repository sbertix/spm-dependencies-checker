const core = require('@actions/core')
const github = require('@actions/github')
const semver = require('semver')

const util = require('util')
const exec = util.promisify(require('child_process').exec)

// load inputs.
const language = core.getInput('language') || 'txt'
const excluding = (core.getInput('excluding') || '').split(/\r?\n/)
// process.
exec('swift package show-dependencies')
  .then(x => {
    if (x['stderror']) throw new Error(x['stderror'])
    else return x['stdout']
  })
  .then(stdout => (
    stdout
    .match(/<(.*?)>/g)
    .map(x => {
      const url = x.match(/^<(.*?)@/)[1]
      const version = x.match(/@(.*?)>$/)[1]
      const name = url.match(/\/([^\/]*?)\/([^\/]*?)(.git)?$/)
      return {
        url: url,
        installed: semver.clean(version),
        owner: name[1],
        name: name[2]
      }
    })
    .filter(x => !(excluding.includes(x.name) || excluding.includes('@'+x.author)))
  ))
  .then(deps => (
    Promise.all(
      deps.map(d => (
        exec(`git ls-remote --tags ${d.url}`)
          .then(x => {
            if (x['stderror']) throw new Error(x['stderror'])
            else return x['stdout']
          })
          .then(tags => (
            {
              ...d,
              last: tags
                .match(/[0-9]+\.[0-9]+\.[0-9]+/g)
                .sort(semver.rcompare)[0]
            }
          ))
      ))
    )
  ))
  .then(x => x.filter(x => semver.gt(x.last, x.installed)))
  .then(x => {
    core.setOutput('outdated-dependencies', JSON.stringify(x))
    // Write message.
    switch (language) {
      case 'html':
        if (x.length === 0) {
          core.setOutput(
            'message',
            `<h3>Dependencies<h3>
            <p>No dependencies need updating.</p>`
          )
        } else {
          core.setOutput(
            'message',
            `<h3>Dependencies<h3>
            <p>
            <ul>${x.map(d => `<li><a href=${d.url}><strong>${d.author}/${d.name}</strong></a>: ${d.installed} &rarr; ${d.last}</li>`).join('')}</ul>
            </p>`
          )
        }
        break
      default:
        if (x.length === 0) { core.setOutput('message', 'No dependencies need updating.') }
        else { core.setOutput('message', `${x.map(d => `${d.url} (${d.installed} -> ${d.last})`).join(', ')} need(s) updating.`) }
    }
  })
  .catch(error => core.setFailed(error.message))
