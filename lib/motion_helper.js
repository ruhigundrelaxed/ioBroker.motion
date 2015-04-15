/**
 * Created by root on 12.04.15.
 */
var request = require('request');
//var events = require('events');
//var util =              require('util');
var events =      require('events');
var EventEmitter = require('events').EventEmitter;
net = require('net');

var fs = require('fs');

var all_finished = false;
//setInterval(mycb,250);

function Motion(server, port, user, pw, event_port, callback) {
    var that = this;
    this.uri = server + ":" + (port);
    this.user = user;
    this.pw = pw;
    this.mydatatypes = JSON.parse(fs.readFileSync(__dirname + '/motion.json', 'utf8'));
    this.motiondata = {};
    this.readycounter = 0;
    this.controller = new events.EventEmitter();
    this.setStateConfigQueue = [];


this.set_control = function(data){
    var src_arr = data.split('.');
    if (src_arr[1] == 'default'){
        var my_dev = 0;
    }else{
        var my_dev = src_arr[1].replace('thread','');
    }
    switch (src_arr[2]) {
        case 'makemovie':
            var my_call = that.uri + '/' + my_dev + '/' + 'action/makemovie';
            request(my_call);
            break;
        case 'snapshot':
            var my_call = that.uri + '/' + my_dev + '/' + 'action/snapshot';
            request(my_call);
            break;
        case 'restart':
            var my_call = that.uri + '/' + my_dev + '/' + 'action/restart';
            request(my_call);
            break;
        case 'detection':

            break;


    }

}

    get_dev(function(){
        callback(that.motiondata);
    });

    net.createServer(function (socket) {
        socket.on('data', function (data) {
            that.controller.emit("motion_event",data.toString());
        });
    }).listen(event_port);


    function get_dev(callback) {
        var fnscope = this;
        fnscope.devices = [];
        request(that.uri, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var def_arr = body.split("\n");
                var dev_name;
                for (i = 1; i < (def_arr.length - 1); i++) {
                    if (i == 1) {
                        dev_name = 'default';
                    } else {
                        dev_name = 'thread' + (i - 1);
                    };
                    that.motiondata[dev_name] = {};
                    get_dev_val(dev_name, function () {
                        if (that.readycounter == (def_arr.length - 2)){
                            callback(that.motiondata);
                        }
                    })
                }
            }
        })
    };


    function get_dev_val(device, callback) {
        var dev_vals = [];
        var mydevice;
        if (device == 'default'){
            mydevice = 0;
        }else{
            mydevice = (device.replace('thread',''))
        }
        request(that.uri + "/" + mydevice + "/config/list", function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var conf_arr = body.split("\n");
                var mytuple = {};

                for (var y = 0; y < (conf_arr.length - 1); y++) {
                    var key_val_arr = conf_arr[y].split("=");
                    var mykey = key_val_arr[0].trim();
                    var myval = key_val_arr[1].trim();
                    var mydt = {};

                    if (typeof(that.mydatatypes[mykey]) == 'undefined') {
                        mydt = that.mydatatypes.default;
                        mydt.common['name'] = mykey;
                        mydt.common['role'] = 'text';
                    } else {
                        mydt = that.mydatatypes[mykey];
                        if (mydt.common['type'] == 'boolean') {
                            mydt.common['role'] = 'switch';
                        } else if (mydt.common['type'] == 'number') {
                            mydt.common['role'] = 'value';
                        } else {
                            mydt.common['role'] = 'text';
                        };
                    };
                    if (mydt['scope'] == 'default') {
                        if (device == 'default') {
                            var object = {type: 'state', common: mydt.common, native: {id: y}};
                            that.motiondata[device][mykey] = {value: myval};
                            that.motiondata[device][mykey]['common'] = mydt.common;
                        }
                    }
                    if (mydt['scope']  == 'both') {
                        var object = {type: 'state', common: mydt.common, native: {id: y}};
                        that.motiondata[device][mykey] = {value: myval};
                        that.motiondata[device][mykey]['common'] = mydt.common;
                    }
                }
                that.readycounter++;
                callback(that.motiondata);
            }
        }.bind({device: device}))
    }
}
module.exports = Motion;



