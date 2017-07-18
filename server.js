/* Parse, validate, manipulate, and display dates and times in JavaScript */
var moment = require('moment');
var fs = require('fs');
/* module provides an interface for reading data from a Readable stream */
var readline = require('readline');
/* module for fetch command line arguments*/
const argv = require('yargs').argv

/* include helperFunctions.js file*/
var helperFunctions = require('./src/helperFunctions.js');

/*
 * Define Variables
 */
var meetingDatesArray = [],confirmMeetingArray = [];
var singleMeetingObject = {};
var officeInTime = 0,officeOutTime = 0,countLine = 1,firstMeetingFlag=0,lineInputString="",fileName = null;

/*
 * reading command line arguments
 */
if (argv.filename) {
    if (fs.existsSync(argv.filename)) {
        fileName = argv.filename;
    }else {
        console.log('Given file doesn’t exist!');
        process.exit(1);
    }
} else {
    console.log('Please specify filename. Exiting...');
    process.exit(1);
}

/*
 * reading data from text file one line at a time
 */
const rl = readline.createInterface({
    input: fs.createReadStream(fileName)
});

/*
 * Start reading data line by line
 * TODO: Optimize line reader so that it doesn't have to rely on odd/even line concept to determine input & Handle more meeting timing scenarios.
 */
rl.on('line', function(line){
    line =line.trim();
    /*
     * Get company office hours from First Line (countLine==1)
     */
    if(countLine==1){
        lineInputString = line.split(" ");
        if(lineInputString.length == 2) {
            officeInTime = lineInputString[0];
            officeOutTime = lineInputString[1];
            if(parseInt(officeOutTime.toString()) < parseInt(officeInTime.toString())){
                console.log("Office hrs are reversed.");
            }
            countLine ++;
        }
    }else{
        lineInputString = line.split(" ");
        if(lineInputString.length == 3){
            /*
             * Get submission time & employee id from every even Line (countLine==1) add into object
             */
            if(countLine%2==0){
                singleMeetingObject = {};
                if(moment(lineInputString[0],'YYYY-MM-DD', true).isValid() && moment(lineInputString[1],'HH:mm:SS', true).isValid()){
                    singleMeetingObject.submissionTime = moment(lineInputString[0]+" "+lineInputString[1]).format();
                    singleMeetingObject.employeeId = lineInputString[2];

                }
            }else{
                /*
                 * Get meeting start time & meeting duration in hours from every odd Line except first line & add into object
                 * Get office start time and office end time by adding company office hours time in request meeting date
                 * Get meeting end time by adding meeting duration in meeting start time
                 * push all meeting objects into meetingDatesArray
                 */
                if(moment(lineInputString[0],'YYYY-MM-DD', true).isValid() && moment(lineInputString[1],'HH:mm', true).isValid()){
                    singleMeetingObject.officeStartTime = moment(lineInputString[0] + " " + officeInTime,'YYYY-MM-DD HHmm');
                    singleMeetingObject.officeEndTime = moment(lineInputString[0] + " " + officeOutTime,'YYYY-MM-DD HHmm');
                    singleMeetingObject.meetingStartTime = moment(lineInputString[0] + " " + lineInputString[1]);
                    singleMeetingObject.durationHours = lineInputString[2];
                    singleMeetingObject.meetingEndTime = moment(lineInputString[0] + " " + lineInputString[1]).add(singleMeetingObject.durationHours, 'hours');
                    meetingDatesArray.push(singleMeetingObject);
                }
            }
            countLine ++;
        }else{
            // Assumption: processing rest of the entries even if some are not in the correct format
            console.log("input paramter is missing on line no:"+countLine);
        }
    }

}).on('close', function() {
    bookMeetingProcess();
}).on('error', function(e) {
    console.log('Something went wrong : - '+ e);
    process.exit(1);
});

/**
 * Process Bookings in the chronological order in which they were submitted.
 */
function bookMeetingProcess() {
    /*
     * Sort meetingDatesArray by submission date
     */
    meetingDatesArray.sort(function(a,b) {
        return new Date(a.submissionTime).getTime() - new Date(b.submissionTime).getTime()
    });

    for(var t=0;t<meetingDatesArray.length;t++){
        var officeStartTime = meetingDatesArray[t].officeStartTime;
        var officeEndTime = meetingDatesArray[t].officeEndTime;

        /**
         * check No part of a meeting is falling outside office hours.
         */
        if(officeStartTime.isSameOrBefore(meetingDatesArray[t].meetingStartTime) && meetingDatesArray[t].meetingEndTime.isSameOrBefore(officeEndTime)){
            if(firstMeetingFlag==0){
                confirmMeetingArray.push(meetingDatesArray[t]);
                firstMeetingFlag=1;
            }
            else{
                var notOverLapsFlag =0;
                for(var a=0;a<confirmMeetingArray.length;a++){
                    /*
                     * check meeting is overlapping or not
                     */
                    var overLapOrNot = helperFunctions.dateRangeOverlaps(confirmMeetingArray[a].meetingStartTime,confirmMeetingArray[a].meetingEndTime,meetingDatesArray[t].meetingStartTime,meetingDatesArray[t].meetingEndTime);
                    if(!overLapOrNot){
                        notOverLapsFlag = 1;
                    }else{
                        notOverLapsFlag = 0;
                        break;
                    }
                }
                /*
                 * meeting is not overlapping so we can push into confirmMeetingArray array for display as output
                 */
                if(notOverLapsFlag){
                    confirmMeetingArray.push(meetingDatesArray[t]);
                }
            }
        }
    }
    displayMeetingCalendar();
}

/**
 * bookings being grouped chronologically by day and display output on console
 */
function displayMeetingCalendar() {
    /*
     * Sort meetingDatesArray by meeting date for bookings being grouped chronologically by day.
     */
    confirmMeetingArray.sort(function(a,b) {
        return new Date(a.meetingStartTime).getTime() - new Date(b.meetingStartTime).getTime()
    });

    var showDate =0;
    var checkDate = "";
    for(var i=0;i<confirmMeetingArray.length;i++){
        showDate =0;
        if(checkDate !=""){
            if(moment(checkDate).isBefore(moment(moment(confirmMeetingArray[i].meetingStartTime).format("YYYY-MM-DD")))){
                checkDate = moment(confirmMeetingArray[i].meetingStartTime).format("YYYY-MM-DD");
                showDate =1;
            }
        }else{
            checkDate = moment(confirmMeetingArray[i].meetingStartTime).format("YYYY-MM-DD");
            showDate =1;
        }

        if(showDate){
            console.log(moment(confirmMeetingArray[i].meetingStartTime).format("YYYY-MM-DD"));
        }
        console.log(moment(confirmMeetingArray[i].meetingStartTime).format("HH:mm")+" "+moment(confirmMeetingArray[i].meetingEndTime).format("HH:mm")+" "+confirmMeetingArray[i].employeeId);
    }
    process.exit(0);
}



