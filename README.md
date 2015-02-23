# powershell-command-executor-ui

AngularJS interface and simple Node.js REST api for testing Powershell command execution; built on top of [powershell-command-executor](https://github.com/bitsofinfo/powershell-command-executor) and [stateful-process-command-proxy](https://github.com/bitsofinfo/stateful-process-command-proxy)

* [Setup](#setup)
* [Related tools](#related)
* [Security](#security)

![Alt text](/diagram1.png "Diagram1")

![Alt text](/diagram2.png "Diagram2")

###<a name="setup"></a> Setup

1. Clone **this** repo

2. Clone https://github.com/bitsofinfo/powershell-command-executor somewhere on the same machine (this module is not available via npm yet...)

3. `npm install .`

4. [Follow these instructions next](https://github.com/bitsofinfo/powershell-command-executor). Specifically you need to setup your stored encrypted credentials.

5. Open `routes/index.js` and edit the `require` paths (specifically the path to where powershell-command-executor was cloned) and special path variables at the top, as appropriate for your local setup (i.e. paths to the encrypted credentials, secret key and decrypt routines described in item 3 above)

6. Run `node bin\www`

7. In a browser go to http://localhost:3000

8. You can tweak the commandRegistry provided by [o365Utils.js](https://github.com/bitsofinfo/powershell-command-executor/blob/master/o365Utils.js) as you wish to add additional command configurations, or modify `routes/index.js` to augment this structure manually as PSCommandService is constructed.

9. DON'T expose this outside of localhost! Read the security section below.


###<a id="related"></a> Related Tools

Have a look at these related projects which support this module and are required to use it

* https://github.com/bitsofinfo/stateful-process-command-proxy - The root dependency of this module, provides the actual bridging between node.js and a pool of external shell processes
* https://github.com/bitsofinfo/powershell-command-executor - The next dependency of this module, which provides the actual backend for the registry of executable commands and wraps the stateful-process-command-proxy
* https://github.com/bitsofinfo/meteor-shell-command-mgr - Small Meteor app that lets you manage/generate a command registry for powershell-command-executor

###<a id="security"></a> Security

There is no security for this app! It should not be run as-is on a production host nor be accessible anywhere other than localhost without modification to secure it. [Why? Read more here! https://github.com/bitsofinfo/stateful-process-command-proxy#security](https://github.com/bitsofinfo/stateful-process-command-proxy#security)
