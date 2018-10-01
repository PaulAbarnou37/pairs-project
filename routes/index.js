const express = require('express');
const router  = express.Router();
const Moment = require('moment');
const MomentRange = require('moment-range');
const moment = MomentRange.extendMoment(Moment);

//TASK TO FOLLOW:
// 1. Convert every date to String: multidate pickers returns [date, date, date] => create an error;
// 2. Convert every date to format DD/MM/YY




/* GET home page */
router.get('/', (req, res, next) => {

  let startDate = "2018-10-07 02:00:00.000".split(" ")[0].split("-");
  let endDate = "2018-10-14 02:00:00.000".split(" ")[0].split("-");

  let datePickedOne = [
                        "Mon Oct 08 2018 00:00:00 GMT+0200 (heure d’été d’Europe centrale)", 
                        "Tue Oct 09 2018 00:00:00 GMT+0200 (heure d’été d’Europe centrale)", 
                        "Sun Oct 07 2018 00:00:00 GMT+0200 (heure d’été d’Europe centrale)",
                        "Wed Oct 10 2018 00:00:00 GMT+0200"
                      ];

  let datePickedTwo = [
                        "Wed Oct 10 2018 00:00:00 GMT+0200", 
                        "Thu Oct 11 2018 00:00:00 GMT+0200", 
                        "Fri Oct 12 2018 00:00:00 GMT+0200", 
                        "Sat Oct 13 2018 00:00:00 GMT+0200"
                      ];

  let pickedOneAndTwo = [];


// 1. Function transform date to 2018-10-08 format          
  function convertDate(d){
    var parts = d.split(" ");
    var months = {Jan: "01",Feb: "02",Mar: "03",Apr: "04",May: "05",Jun: "06",Jul: "07",Aug: "08",Sep: "09",Oct: "10",Nov: "11",Dec: "12"};
    return parts[3]+"-"+months[parts[1]]+"-"+parts[2];
   }
 
// 2. Transform my Dates (startDate, endDate, PickedOne & PickedTwo) of dates to 2018-10-08 format

  datePickedOne   = datePickedOne.map(function (oneDate){
    return convertDate(oneDate);
    });
  datePickedTwo   = datePickedTwo.map(function (oneDate){
    return convertDate(oneDate);
    });  

    // I convert these 2 into date/not-a-string format to calculate how many days in between
  startDate = new Date(startDate[0], startDate[1], startDate[2]);

  endDate = new Date(endDate[0], endDate[1], endDate[2]); ;
  
   

// 3. Compare those 2 dates 

    // Count how many days from the start to end date
    const daysInBetween = ((endDate - startDate)/1000/60/60/24) ;
    console.log('Range: ', daysInBetween);

    // Count how many night both persons cumulated wanna stay
    const totalNights = datePickedOne.length + datePickedTwo.length ;
    console.log('They both wanna stay :',totalNights)

    // Count how many duplicates days

    datePickedOne.forEach(function (oneDate){
      pickedOneAndTwo.push(oneDate);
      });

    datePickedTwo.forEach(function (oneDate){
      pickedOneAndTwo.push(oneDate);
      }); 

    function findDuplicatedDates(arra1) {
      var object = {};
      var result = [];

      arra1.forEach(function (item) {
        if(!object[item])
            object[item] = 0;
          object[item] += 1;
      })

      for (var prop in object) {
         if(object[prop] >= 2) {
             result.push(prop);
         }
      }

      if (result.length === 0){
        return 0
      } else {
        let numberDuplicates = result.length;
        return numberDuplicates
      };
  }


  findDuplicatedDates(pickedOneAndTwo);

    console.log(find_duplicate_in_array([1, 2, -2, 4, 5, 4, 7, 8, 7, 7, 71, 3, 6]));
    



  res.json({message: 'coucou ca marche'});
});

module.exports = router;
