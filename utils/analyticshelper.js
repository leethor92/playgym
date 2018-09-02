'use strict';

const assessmentstore = require('../models/assessment-store');

const analytics = {
  
   calculateBMI(member) {
    const height = member.height;
    const weight = this.getCurrentWeight(member);
    return ((weight / height) / height).toFixed(2);
  },
  
  getBMICategory(member) {
    const bmi = this.calculateBMI(member);
    if (bmi < 15) {
      return 'VERY SEVERELY UNDERWEIGHT';
    } else if (bmi >= 15 && bmi < 16) {
      return 'SEVERELY UNDERWEIGHT';
    } else if (bmi >= 16 && bmi < 18.5) {
      return 'UNDERWEIGHT';
    } else if (bmi >= 18.5 && bmi < 25) {
      return 'NORMAL';
    } else if (bmi >= 25 && bmi < 30) {
      return 'OVERWEIGHT';
    } else if (bmi >= 30 && bmi < 35) {
      return 'MODERATELY OBESE';
    } else if (bmi >= 35 && bmi < 40) {
      return 'SEVERELY OBESE';
    } else if (bmi >= 40) {
      return 'VERY SEVERELY OBESE';
    }

    return 'Error in BMI Calculation';
  },
  
  idealBodyWeight(member) {
    let genderWeight = 0;

    let heightInInches = this.convertHeightMetresToInches(member.height);
    if (heightInInches < 60) {
      heightInInches = 60;
    }

    if (member.gender === 'Male') {
      genderWeight = 50;
    } else {
      genderWeight = 45.5;
    }

    const idealBodyWeight = genderWeight + ((heightInInches - 60) * 2.3);
    return idealBodyWeight;
  },
  
  isIdealBodyWeight(member) {
    const weight = this.getCurrentWeight(member);

    const idealBodyWeight = this.idealBodyWeight(member);

    if (weight >= (idealBodyWeight - 2) && weight <= (idealBodyWeight + 2)) {
      return 'green';
    } else if (weight >= (idealBodyWeight - 5) && weight <= (idealBodyWeight + 5)) {
      return 'yellow';
    } else if (weight >= (idealBodyWeight - 8) && weight <= (idealBodyWeight + 8)) {
      return 'orange';
    } else {
      return 'red';
    }
  },
  
  getCurrentWeight(member) {
    const assessments = assessmentstore.getSortedAssessments(member.id);
    if (assessments.length > 0) {
      return assessments[0].weight;
    } else {
      return member.weight;
    }
  },
  
  convertHeightMetresToInches(height) {
    const heightInInches = (height * 39.37).toFixed(2);
    return heightInInches;
  },
};

module.exports = analytics;