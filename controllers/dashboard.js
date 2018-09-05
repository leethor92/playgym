'use strict';

const accounts = require('./accounts');
const logger = require('../utils/logger');
const uuid = require('uuid');
const assessmentstore = require('../models/assessment-store');
const analyticshelper = require('../utils/analyticshelper');
const goalstore = require('../models/goal-store');

const dashboard = {
  index(request, response) {
    logger.info('dashboard rendering');
    const loggedInMember = accounts.getCurrentMember(request);
    logger.debug(goalstore.getSortedGoals(loggedInMember.id));
    const viewData = {
      title: 'Gym App Dashboard',
      member: loggedInMember,
      assessments: assessmentstore.getAssessmentsTrends(loggedInMember, analyticshelper.idealBodyWeight(loggedInMember)),
      goals: goalstore.getSortedGoals(loggedInMember.id),
      bmi: analyticshelper.calculateBMI(loggedInMember),
      bmiCategory: analyticshelper.getBMICategory(loggedInMember),
      idealWeightIndicator: analyticshelper.isIdealBodyWeight(loggedInMember),
    };
    response.render('dashboard', viewData);
  },
  
  goals(request, response) {
    logger.info('Goals rendering');
    const loggedInMember = accounts.getCurrentMember(request);
    const viewData = {
      title: 'Members Goals',
      member: loggedInMember,
      goals: goalstore.getSortedGoals(loggedInMember.id),
    };
    response.render('goals', viewData);
  },
  
  addGoal(request, response) {
    const memberId = accounts.getCurrentMember(request).id;
    const date = new Date(request.body.date);
    const goal = {
      goalId: uuid(),
      date: date.toString(),
      weight: request.body.weight,
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
      tolerance: request.body.tolerance,
      description: request.body.description,
    };
    goalstore.addGoal(memberId, goal);
    response.redirect('/goals');
  },

  addAssessment(request, response) {
    const memberId = request.params.id;
    const assessment = {
      assessmentId: uuid(),
      date: (new Date(), 'ddd, dd mmm yyyy HH:MM:ss Z'),
      weight: request.body.weight,
      chest: request.body.chest,
      thigh: request.body.thigh,
      upperArm: request.body.upperArm,
      waist: request.body.waist,
      hips: request.body.hips,
    };
    assessmentstore.addAssessment(memberId, assessment);
    response.redirect('/dashboard/');
  },

  deleteAssessment(request, response) {
    const memberId = request.params.memberid;
    const assessmentId = request.params.assessmentid;
    assessmentstore.removeAssessment(memberId, assessmentId);
    response.redirect('/dashboard/');
  },
};
  


module.exports = dashboard;

