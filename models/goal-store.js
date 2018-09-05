'use strict'

const _ = require('lodash');
const JsonStore = require('./json-store');
const logger = require('../utils/logger');
const assessmentstore = require('../models/assessment-store');

const goalStore = {
  
  store: new JsonStore('./models/goal-store.json', { membersGoals: [] }),
  collection: 'membersGoals',
  
      
  getGoals(memberId) {
    const goals = this.store.findOneBy(this.collection, { memberId: memberId }).goals;
    return goals;
  },
    
  getSortedGoals(memberId) {
    const goals = this.getGoals(memberId);
    let sortedGoals = _.orderBy(goals, function (value) {
      return new Date(value.date);
    }).reverse();
    
  const assessments = assessmentstore.getSortedAssessments(memberId);
    for (let i = 0; i < sortedGoals.length; i++) {
      let goal = sortedGoals[i];
      goal.status ='ongoing';
      const goalCloseDate = new Date(goal.date);
      const goalOpenDate = new Date(goalCloseDate);
      goalOpenDate.setDate(goalOpenDate.getDate() - 3);
      goalCloseDate.setTime(goalCloseDate.getTime() + 1000 * 3600 * 24 - 1);
      
      if (new Date() < goalOpenDate) {
        goal.status = 'pending';
      } else {
      for(let j = 0; j < assessments.length; j++) {
        const assessment = assessments[j];
        const assessmentDate = new Date(assessment.date);
        if(assessmentDate <= goalCloseDate && assessmentDate >= goalOpenDate) {
            let allAchieved = true;
             if (assessment.weight < Number(goal.weight - goal.tolerance) || assessment.weight > Number(goal.weight + goal.tolerance)) {
              allAchieved = false;
            }
             if (assessment.chest < Number(goal.chest - goal.tolerance) || assessment.chest > Number(goal.chest + goal.tolerance)) {
              allAchieved = false;
            }
             if (assessment.thigh < Number(goal.thigh - goal.tolerance) || assessment.thigh > Number(goal.thigh + goal.tolerance)) {
              allAchieved = false;
            }
             if (assessment.upperArm < Number(goal.upperArm - goal.tolerance) || assessment.upperArm > Number(goal.upperArm + goal.tolerance)) {
              allAchieved = false;
            }
             if (assessment.waist < Number(goal.waist - goal.tolerance) || assessment.waist > Number(goal.waist + goal.tolerance)) {
              allAchieved = false;
            }
             if (assessment.hips < Number(goal.hips - goal.tolerance) || assessment.hips > Number(goal.hips + goal.tolerance)) {
              allAchieved = false;
            }
             if (allAchieved) {
              goal.status = 'achieved';
            } else {
              if (new Date() >= goalCloseDate) {
                goal.status = 'missed';
              }
            }
             break;
        }
      }
    }
  }
    return sortedGoals;
  },
  
                  
    
  createEmptyArray(memberId) {
    const data = {
      memberId: memberId,
      goals: [],
      };
      this.store.findAll(this.collection).push(data);
      this.store.save(); 
    },
      
  addGoal(memberId, goal) {
    const goals = this.getGoals(memberId);
    goals.push(goal);
    this.store.save();
  },
    
  deleteMembersGoals(memberId) {
    _.remove(this.store.findAll(this.collection), {memberId: memberId });
    this.store.save();
  },
};

module.exports = goalStore;