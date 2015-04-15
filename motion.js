

/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

// you have to require the utils module and call adapter function
var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');
var trim = require('trim');
var server = "http://localhost:8888";
var pic_server = "http://zuhause.muffbu.de/cam1/"
var mymotionmod = require(__dirname + '/lib/motion_helper.js');
// you have to call the adapter function and pass a options object
// name has to be set and has to be equal to adapters folder name and main file name excluding extension
// adapter will be restarted automatically every time as the configuration changed, e.g system.adapter.example.0
var adapter = utils.adapter('motion');

var mymotion;








// is called when adapter shuts down - callback has to be called under any circumstances!
adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

// todo
adapter.on('discover', function (callback) {

});

// todo
adapter.on('install', function (callback) {

});

// todo
adapter.on('uninstall', function (callback) {

});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    adapter.log.info('objectChange ' + id + ' ' + JSON.stringify(obj));
});

//function stateChanged(id, state) {

//}

//function stateChange(id, state) {
//    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
//    var src_arr = id.split(".");
//    var src_ada = src_arr[0];
//    var src_inst = src_arr[1];
//    var src_ent = src_arr[2];
//    var src_con = src_arr[3];
//    var src_key = src_arr[4];

//    if (src_ent == 'default')
//    {
//        var my_tok = 0;
//    }else{
//        var my_tok = src_ent.replace('thread', '');
//    };
//    //request("http://localhost:8888/"+ my_tok +"/config/set?" + src_key + "=" + state["val"],function (error, response, body) {
//    request("http://localhost:8888/"+ this.my_tok +"/config/write");

//    console.log(state["val"]);
    // you can use the ack flag to detect if state is desired or acknowledged
//    if (!state.ack) {
//        adapter.log.info('ack is not set!');
//    }

//    adapter.on('stateChange', stateChanged);
//}

// is called if a subscribed state changes
//adapter.on('stateChange', initialStateChange);


 // is called if a subscribed state changes
 adapter.on('stateChange', function (id, state) {
    adapter.log.info('stateChange ' + id + ' ' + JSON.stringify(state));
    var src_arr = id.split(".");
    var src_ada = src_arr[0];
    var src_inst = src_arr[1];
    var src_ent = src_arr[2];
    var src_con = src_arr[3];
    var src_key = src_arr[4];
    if (typeof(mymotion)=='object'){
        if (src_con == 'config') {

            //mymotion.setStateConfigQueue.push(JSON.stringify(state));

        }else if(src_con == 'control'){
            adapter.log.info(src_con + '.' + src_key +'.'+ state.val);
            mymotion.set_control(src_con + '.' +src_ent + '.' + src_key +'.'+ state.val);
        }
    }
    if (src_ent == 'default')
    {
        var my_tok = 0;
    }else{
        var my_tok = src_ent.replace('thread', '');
    };

    //request("http://localhost:8888/"+ my_tok +"/config/set?" + src_key + "=" + state["val"],function (error, response, body) {
    //request("http://localhost:8888/"+ this.my_tok +"/config/write");

    //console.log(state["val"]);
    // you can use the ack flag to detect if state is desired or acknowledged
    if (!state.ack) {
        adapter.log.info('ack is not set!');
    }
});


// Some message was sent to adapter instance over message box. Used by email, pushover, text2speech, ...
adapter.on('message', function (obj) {
    if (typeof obj == "object" && obj.message) {
        if (obj.command == "send") {
            // e.g. send email or pushover or whatever
            console.log("send command");

            // Send response in callback if required
            if (obj.callback) adapter.sendTo(obj.from, obj.command, 'Message received', obj.callback);
        }
    }
});

// is called when databases are connected and adapter received configuration.
// start here!
adapter.on('ready', function () {
    main();
});



function main() {
    mymotion = new mymotionmod(adapter.config['Motion HTTP Server'],adapter.config['Motion HTTP Server Port'],'','',adapter.config['Motion Eventing Port'],function(devices){
    var deviceobj = {};
       for (var device in devices){
           deviceobj = devices[device];
            var dev_name = device;
            var mydevice =  {type: 'device',common: {type: 'boolean'}, native:{id: dev_name}}
            adapter.setObject(dev_name, mydevice);
            var mychannel = {type: 'channel',  common:{name: 'config'}, native:{id: dev_name + 'channel'}};
            adapter.setObject(dev_name + '.' + 'config', mychannel);
            for (var setting in deviceobj){
                var settingobj = deviceobj[setting];
                var mycommon = settingobj.common;
                var myval = settingobj.value;
                var object ={type: 'state', common: mycommon, native:{id: dev_name + 'channel' + mycommon.name}};
                adapter.setObject(dev_name+'.config.'+ mycommon.name, object);
                adapter.setState (dev_name+'.config.'+ mycommon.name, {val: myval, ack: true});
            }
            var myevents = {type: 'channel',  common:{name: 'events'}, native:{id: dev_name+ 'events'}};
            adapter.setObject(dev_name + '.' + 'events', myevents);

            var object ={type: 'state', common: {role: 'switch'}, native:{id: dev_name+ 'events.event'}};
            adapter.setObject(dev_name + '.events.event', object);
            var object ={type: 'state', common: {role: 'text.url'}, native:{id: dev_name+ 'events.lastmovie'}};
            adapter.setObject(dev_name + '.events.lastmovie', object);
            var object ={type: 'state', common: {role: 'text.url'}, native:{id: dev_name+ 'events.lastpicture'}};
            adapter.setObject(dev_name + '.events.lastpicture', object);
            var object ={type: 'state', common: {role: 'switch'}, native:{id: dev_name+ 'events.areadetect'}};
            adapter.setObject(dev_name + '.events.areadetect', object);
            var object ={type: 'state', common: {role: 'switch'}, native:{id: dev_name+ 'events.camera_lost'}};
            adapter.setObject(dev_name + '.events.camera_lost', object);



           var mycontrol = {type: 'channel',  common:{name: 'control'}, native:{id: dev_name+ 'control'}};
            adapter.setObject(dev_name + '.' + 'control', mycontrol);

           //Soll Detection pausieren und resumen lassen. (status, start, pause)
           var object ={type: 'state', common: {role: 'switch'}, native:{id: dev_name+ 'control.detection'}};
           adapter.setObject(dev_name + '.control.detection', object);
           //Read only. Zeigt ob device connected. (connection)
           var object ={type: 'state', common: {role: 'indicator'}, native:{id: dev_name+ 'control.connection'}};
           adapter.setObject(dev_name + '.control.connection', object);
           //Erstellt Snapshot (snapshot)
           var object ={type: 'state', common: {role: 'button'}, native:{id: dev_name+ 'control.snapshot'}};
           adapter.setObject(dev_name + '.control.snapshot', object);
           //Bricht laufende Aufzeichnung ab und erstellt einen Film. (makemovie)
           var object ={type: 'state', common: {role: 'button'}, native:{id: dev_name+ 'control.makemovie'}};
           adapter.setObject(dev_name + '.control.makemovie', object);
           //Startet motion neu und liest alle Konfig Variablen neun aus den Files.
           var object ={type: 'state', common: {role: 'switch'}, native:{id: dev_name+ 'control.restart'}};
           adapter.setObject(dev_name + '.control.restart', object);
        }

    })
    mymotion.controller.on("motion_event",function(data){

        var mydata = JSON.parse(data);
        console.log(mydata);
        if (mydata.event == 'on_event_start'){
            adapter.setState ('thread'+ mydata.thread + '.events.event', {val: true, ack: true});
        };
        if (mydata.event == 'on_event_end'){
            adapter.setState ('thread'+ mydata.thread + '.events.event', {val: false, ack: true});
        };
        if (mydata.event == 'on_movie_end'){
            adapter.setState ('thread'+ mydata.thread + '.events.lastmovie', {val: pic_server + (mydata.filename.split('/').pop()), ack: true});
        };
        if (mydata.event == 'on_picture_save'){
            adapter.setState ('thread'+ mydata.thread + '.events.lastpicture', {val: pic_server + (mydata.filename.split('/').pop()), ack: true});
        };
    });

    ;


    //adapter.setObject(this.my_dev_name+'.config.'+ mykey, object);
    //adapter.setState (this.my_dev_name+'.config.'+ mykey, {val: myval, ack: true});

    adapter.subscribeStates('*');




    /**
     *
     *      For every state in the system there has to be also an object of type state
     *
     *      Here a simple example for a boolean variable named "testVariable"
     *
     *      Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
     *
     */


    // in this example all states changes inside the adapters namespace are subscribed

}

/**
 *   setState examples
 *
 *   you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
 *
 */

// the variable testVariable is set to true
//adapter.setState('testVariable', true);



// same thing, but the value is flagged "ack"
// ack should be always set to true if the value is received from or acknowledged from the target system
//adapter.setState('testVariable', {val: true, ack: true});



// same thing, but the state is deleted after 30s (getState will return null afterwards)
//adapter.setState('testVariable', {val: true, ack: true, expire: 30});



// examples for the checkPassword/checkGroup functions
//adapter.checkPassword('admin', 'iobroker', function (res) {
//    console.log('check user admin pw ioboker: ' + res);
//});

//adapter.checkGroup('admin', 'admin', function (res) {
//    console.log('check group user admin group admin: ' + res);
//    }





