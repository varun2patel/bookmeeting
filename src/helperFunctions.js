module.exports = {
    /**
     * This function checks if meeting time is overlapping or not
     *
     * @param meeting1StartTime
     * @param meeting1EndTime
     * @param meeting2StartTime
     * @param meeting2EndTime
     *
     * @return true if meeting is overlapping else false
     */
    dateRangeOverlaps: function (meeting1StartTime, meeting1EndTime, meeting2StartTime, meeting2EndTime) {

        if(meeting1StartTime.isSameOrBefore(meeting2StartTime) && meeting2StartTime.isBefore(meeting1EndTime)) return true;

        if(meeting1StartTime.isBefore(meeting2EndTime) && meeting2EndTime.isSameOrBefore(meeting1EndTime)) return true;

        if(meeting2StartTime.isBefore(meeting1StartTime) && meeting1EndTime.isBefore(meeting2EndTime))  return true;

        return false;

    }
};