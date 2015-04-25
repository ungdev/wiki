# Wiki

## Installation

### Install RethinkDB :

```sh
echo "deb http://download.rethinkdb.com/apt `lsb_release -cs` main" | sudo tee /etc/apt/sources.list.d/rethinkdb.list
wget -qO- http://download.rethinkdb.com/apt/pubkey.gpg | sudo apt-key add -
sudo apt-get update
sudo apt-get install rethinkdb
```

More on [official docs](http://www.rethinkdb.com/docs/install/debian/)

### Install Bower (*as root*) :

```sh
npm install -g bower
```

### Install dependencies :

```sh
npm install
bower install
```

## Edit configuration :

Edit file `{wiki_dir}/config.json` to match the server

## Launch

### Launch RethinkDB :

```sh
rethinkdb&
```

### Start webserver :

```sh
node app.js
```

