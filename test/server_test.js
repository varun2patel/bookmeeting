/** Include server file */
const helperFunctions = require('../src/helperFunctions.js');
var moment = require('moment');
var assert = require('assert');

/* TODO: add more unit tests around the application */

suite('dateRangeOverlaps function', function() {

    test('should return true if meeting time overlaps case - 1', function() {
        var meeting1StartTime = moment('2015-08-21 09:00');
        var meeting1EndTime = moment('2015-08-21 11:00');
        var meeting2StartTime = moment('2015-08-21 10:00');
        var meeting2EndTime = moment('2015-08-21 12:00');
        var meetingOverlap = helperFunctions.dateRangeOverlaps(meeting1StartTime,meeting1EndTime,meeting2StartTime,meeting2EndTime);
        assert.equal(true, meetingOverlap);
    });

    test('should return false if meeting time doesn\'t overlaps', function() {
        var meeting1StartTime = moment('2015-08-21 09:00');
        var meeting1EndTime = moment('2015-08-21 11:00');
        var meeting2StartTime = moment('2015-08-21 12:00');
        var meeting2EndTime = moment('2015-08-21 02:00');
        var meetingOverlap = helperFunctions.dateRangeOverlaps(meeting1StartTime,meeting1EndTime,meeting2StartTime,meeting2EndTime);
        assert.equal(false, meetingOverlap);
    });

    test('should return false if another meeting starts just after already running meeting ends', function() {
        var meeting1StartTime = moment('2015-08-21 12:00');
        var meeting1EndTime = moment('2015-08-21 13:00');
        var meeting2StartTime = moment('2015-08-21 11:00');
        var meeting2EndTime = moment('2015-08-21 12:00');
        var meetingOverlap = helperFunctions.dateRangeOverlaps(meeting1StartTime,meeting1EndTime,meeting2StartTime,meeting2EndTime);
        assert.equal(false, meetingOverlap);
    });

    test('should return true if meeting time overlaps case - 2', function() {
        var meeting1StartTime = moment('2015-08-21 12:00');
        var meeting1EndTime = moment('2015-08-21 16:00');
        var meeting2StartTime = moment('2015-08-21 13:00');
        var meeting2EndTime = moment('2015-08-21 15:00');
        var meetingOverlap = helperFunctions.dateRangeOverlaps(meeting1StartTime,meeting1EndTime,meeting2StartTime,meeting2EndTime);
        assert.equal(true, meetingOverlap);
    });

});