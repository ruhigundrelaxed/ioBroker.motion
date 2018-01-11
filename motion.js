"use strict";


var utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');
var trim = require('trim');
var mymotionmod = require(__dirname + '/lib/motion_helper.js');
var adapter = utils.Adapter('motion');

var mymotion;
var that = this;



adapter.on('unload', function (callback) {
    try {
        adapter.log.info('cleaned everything up...');
        callback();
    } catch (e) {
        callback();
    }
});

// is called if a subscribed object changes
adapter.on('objectChange', function (id, obj) {
    adapter.log.debug('objectChange ' + id + ' ' + JSON.stringify(obj));
});

adapter.on('stateChange', function (id, state) {
	var stateval;
	var self = this;
	var stateval = JSON.stringify(state.val);
	var src_arr = id.split(".");
	var src_ada = src_arr[0];
	var src_inst = src_arr[1];
	var src_ent = src_arr[2];
	var src_con = src_arr[3];
	var src_key = src_arr[4];
	
	adapter.log.debug('stateChange ' + id + ' ' + JSON.stringify(state));
	
	if (typeof(mymotion)=='object'){
		if (src_con == 'control') {
			adapter.log.info(src_con + '.' + src_key +'.'+ state.val);
			mymotion.set_control(src_con + '.' +src_ent + '.' + src_key +'.'+ state.val);
		}
	}
	if (src_ent == 'default'){
		var my_tok = 0;
	}else{
		var my_tok = src_ent.replace('thread', '');
	};
	if (!state.ack) {
			adapter.log.debug("State update: " + stateval);
			mymotion.set_val(my_tok,src_key,stateval,function(res){console.log(res);});
		};

    });


    //console.log(state["val"]);
    // you can use the ack flag to detect if state is desired or acknowledged
  

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
    mymotion = new mymotionmod(adapter.config['address'],adapter.config['port_http'],'','',adapter.config['port_event'],function(devices){
    console.log(Object.keys(devices).length); 
    var deviceobj = {};
       for (var device in devices){
           deviceobj = devices[device];
            var dev_name = device;
            if ((Object.keys(devices).length) == 1){ 
	    	if (dev_name == 'default'){dev_name = 'thread0'}; 
	    }; 
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

            var object ={type: 'state', common: {role: 'switch', type: 'state', name: 'event_in_progress'}, native:{id: dev_name+ 'events.event'}};
            adapter.setObject(dev_name + '.events.event', object);
            var object ={type: 'state', common: {role: 'text.url', type: 'state', name: 'lastmovie'}, native:{id: dev_name+ 'events.lastmovie'}};
            adapter.setObject(dev_name + '.events.lastmovie', object);
            var object ={type: 'state', common: {role: 'text.url', type: 'state', name: 'lastpicture'}, native:{id: dev_name+ 'events.lastpicture'}};
            adapter.setObject(dev_name + '.events.lastpicture', object);
            var object ={type: 'state', common: {role: 'switch', type: 'state', name: 'areadetect' }, native:{id: dev_name+ 'events.areadetect'}};
            adapter.setObject(dev_name + '.events.areadetect', object);
            var object ={type: 'state', common: {role: 'switch', type: 'state', name: 'camera_lost'}, native:{id: dev_name+ 'events.camera_lost'}};
            adapter.setObject(dev_name + '.events.camera_lost', object);



           var mycontrol = {type: 'channel',  common:{name: 'control'}, native:{id: dev_name+ 'control'}};
            adapter.setObject(dev_name + '.' + 'control', mycontrol);


            var object ={type: 'state', common: {role: 'switch', type: 'state', name:'start_detection'}, native:{id: dev_name+ 'control.detection_start'}};
           adapter.setObject(dev_name + '.control.detection_start', object);
           var object ={type: 'state', common: {role: 'switch', type: 'state', name:'pause_detection'}, native:{id: dev_name+ 'control.detection_pause'}};
           adapter.setObject(dev_name + '.control.detection_pause', object);

           //Read only. Zeigt ob device connected. (connection)
           var object ={type: 'state', common: {role: 'indicator', type: 'state', name: 'is_connected'}, native:{id: dev_name+ 'control.connection'}};
           adapter.setObject(dev_name + '.control.connection', object);
           //Erstellt Snapshot (snapshot)
           var object ={type: 'state', common: {role: 'button', type: 'state', name: 'take_snapshot'}, native:{id: dev_name+ 'control.snapshot'}};
           adapter.setObject(dev_name + '.control.snapshot', object);
           //Bricht laufende Aufzeichnung ab und erstellt einen Film. (makemovie)
           var object ={type: 'state', common: {role: 'button', type: 'state', name: 'make_movie'}, native:{id: dev_name+ 'control.makemovie'}};
           adapter.setObject(dev_name + '.control.makemovie', object);
           //Startet motion neu und liest alle Konfig Variablen neun aus den Files.
           var object ={type: 'state', common: {role: 'switch', type: 'state', name: 'restart'}, native:{id: dev_name+ 'control.restart'}};
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
            adapter.setState ('thread'+ mydata.thread + '.events.lastmovie', {val: adapter.config['prefix'] + (mydata.filename.split('/').pop()), ack: true});
        };
        if (mydata.event == 'on_picture_save'){
            adapter.setState ('thread'+ mydata.thread + '.events.lastpicture', {val: adapter.config['prefix'] + (mydata.filename.split('/').pop()), ack: true});
        };
    });

    ;


    //adapter.setObject(this.my_dev_name+'.config.'+ mykey, object);
    //adapter.setState (this.my_dev_name+'.config.'+ mykey, {val: myval, ack: true});

    adapter.subscribeStates('*');
}






