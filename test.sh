#!/bin/bash
case $1 in
   "on_area_detected" )
	json_answer="{\"event\": \"on_area_detected\", \"thread\": $2, \"timestamp\": \"$3\", \"noiselevel\": $4}"
	;;
   "on_camera_lost" )
	json_answer="{\"event\": \"on_camera_lost\", \"thread\": $2, \"timestamp\": \"$3\"}"
	;;
   "on_event_start" )
	json_answer="{\"event\": \"on_event_start\", \"thread\": $2, \"timestamp\": \"$3\", \"noiselevel\": $4}"
	;;
   "on_event_end" )
	json_answer="{\"event\": \"on_event_end\", \"thread\": $2, \"timestamp\": \"$3\", \"noiselevel\": $4}"
	;;
   "on_motion_detected" ) 
       json_answer="{\"event\": \"on_motion_detected\", \"thread\": $2, \"timestamp\": \"$3\", \"noiselevel\": $4}"
	;;
   "on_movie_start" )
       json_answer="{\"event\": \"on_movie_start\", \"thread\": $2, \"timestamp\": \"$3\", \"noiselevel\": $4, \"filename\": \"$5\"}"
	;;
   "on_movie_end" )
       json_answer="{\"event\": \"on_movie_end\", \"thread\": $2, \"timestamp\": \"$3\", \"noiselevel\": $4, \"filename\": \"$5\"}"
	;;
   "on_picture_save" )
	json_answer="{\"event\": \"on_picture_save\", \"thread\": $2, \"timestamp\": \"$3\", \"noiselevel\": $4, \"filename\": \"$5\"}"
	;;
    *)
       json_answer=$1
 
esac



echo $json_answer |netcat 127.0.0.1 6666 
