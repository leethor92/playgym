'use strict';
 
 const _ = require('lodash');
 const JsonStore = require('./json-store');
 const logger = require('../utils/logger');
 
 const assessmentStore = {
 
   store: new JsonStore('./models/assessment-store.json', { membersAssessments: [] }),
   collection: 'membersAssessments',
 
   getAssessments(memberId) {
      const assessments = this.store.findOneBy(this.collection, { memberId: memberId }).assessments;

    return assessments;
  },

  getSortedAssessments(memberId) {
    const assessments = this.getAssessments(memberId);
    let sortedAssessments =  _.orderBy(assessments, function (value) {
          return new Date(value.date);
        }).reverse()

    ;
    return sortedAssessments;
  },
 
   getAssessmentsTrends(member, idealWeight) {
     let assessments = this.getSortedAssessments(member.id);
     for (let i = 0; i < assessments.length; i++) {
       let lastWeight = member.weight;
       if (i < assessments.length - 1) {
         lastWeight = assessments[i + 1].weight;
       };
 
       let deltaCurrent = assessments[i].weight - idealWeight;
       let deltaPrevious = lastWeight - idealWeight;
 
       if (deltaCurrent < 0) {
         deltaCurrent = -deltaCurrent;
       }
       if (deltaPrevious < 0) {
         deltaPrevious = -deltaPrevious;
       }
 
       if (deltaPrevious < deltaCurrent) {
         assessments[i].trend = 'red';
       } else if (deltaPrevious > deltaCurrent) {
         assessments[i].trend = 'green';
       } else {
         assessments[i].trend = 'blue';
       }
     };
 
     return assessments;
   },
   
   createEmptyArray(memberId) {
     const data = {
       memberId: memberId,
       assessments: [],
     };
     this.store.findAll(this.collection).push(data);
     this.store.save();
   },
 
   addAssessment(memberId, assessment) {
     const assessments = this.getAssessments(memberId);
     assessments.push(assessment);
     logger.debug(assessments);
     this.store.save();
   },
 
   removeAssessment(memberId, assessmentid) {
     const assessments = this.getAssessments(memberId);
    _.remove(assessments, { assessmentid: assessmentid });
    this.store.save();
  },
   
   deleteUsersAssessments(memberId) {
    _.remove(this.store.findAll(this.collection), { memberId:memberId });
    this.store.save();
  },
   
   setComment(memberId, assessmentId, comment) {
     const assessments = this.getAssessments(memberId);
     const assessment = _.find(assessments, { assessmentId: assessmentId });
     
     assessment.comment = comment;
     this.store.save();
   },
};

module.exports = assessmentStore;
