# Pxls Constructor

A bot for Pxls.space.

Before you use this purely expiremental tool, please keep in mind that **bots are not allowed on Pxls.space** and you will be banned if discovered, with all your pixels reverted. However, if there is a site that uses the Pxls codebase but doesn't have the restriction on bots, you can use it there instead.

## Installation

1. Download and install the LTS or latest version of [Node.js](https://nodejs.org/en/).
2. Download this repository with `git clone https://github.com/haykam821/Pxls-Constructor.git`
3. Switch to the clone you just made with `cd Pxls-Constructor`.
4. Install dependencies with `npm install`.

## Usage

It is very easy to use this tool. To show help, run this command:

    node . --help

This will show you all command and options you can use. Run `node . build --help` or `node . random --help` to show more options. All constructing features in this bot require a token to work by appending `--token <your token>`; see the below section to find how to get this token.

## Getting Token

Your token is a cookie. To get this cookie, go to the Pxls site, open up the developer tools menu, switch to the Application tab (it may be collapsed, if so use the double arrow next to the other tab names), under storage click Cookies, then the website domain, and finally find the row with `pxls-token`, and copy the value next to that.

Once you have your token, specify it with `--token <your token>`. You can also set this with the `PXLS_CONSTRUCTOR_TOKEN` environment variable.