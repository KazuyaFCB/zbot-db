var userModel = require('../models/UserModel');

module.exports = {
  findAllUsers: async () => {
    try {
      let result = await userModel.findAll(
        {
          limit: 50,
          order: [['phoneNumber', 'ASC']]
        }
      );
      var userList = result.map(userItem => userItem.dataValues);
      return userList;
    } catch (error) {
      console.error('findAllUsers failed:', error);
      throw error;
    }
  },

  findOneUserByPhoneNumber: async (phoneNumber) => {
    try {
      var result = await userModel.findOne(
        {
          where: {
            phoneNumber: phoneNumber,
            // expiredDate: {
            //   $gt: new Date()
            // },
            isBlocked: false
          },
          attributes: ['phoneNumber', 'username', 'expiredDate', 'isBlocked']
        }
      );
      if (result === null) return null;
      return result.dataValues;
    } catch (error) {
      console.error('findOneUserByPhoneNumber failed:', error);
      throw error;
    }
  },

  createOneUser: async (username) => {
    try {
      await userModel.create(
        {
          phoneNumber: username,
          username: username,
          isBlocked: false
        }
      );
    } catch (error) {
      console.error('createOneUser failed:', error);
      throw error;
    }
  },

  updatePhoneNumberByUsername: async (phoneNumber, username) => {
    try {
      await userModel.update(
        {
          phoneNumber: phoneNumber
        },
        {
          where: {
            username: username
          }
        }
      );
    } catch (error) {
      console.error('updatePhoneNumberByUsername failed:', error);
      throw error;
    }
  },

  /*
  case 1:
  expire < now => expire = now + extend
  case 2:
  expire >= now => expire = expire + extend

  // gen ra SQL:

  UPDATE zbot.user 
  SET expired_date = CASE
      WHEN phone_number = 'N01' THEN (GREATEST(CURRENT_DATE, expired_date) + INTERVAL '1 month')
      WHEN phone_number = 'N02' THEN (GREATEST(CURRENT_DATE, expired_date) + INTERVAL '2 month')
      END
  WHERE phone_number IN ('N01','N02');
  
  */
  updateUserByPhoneNumberAndExtendedMonth: async (updatedUsers) => {
    try {
      const phoneNumberField = userModel.rawAttributes.phoneNumber.field;
      const expiredDateField = userModel.rawAttributes.expiredDate.field;

      let sqlQuery = `UPDATE ${userModel.getTableName().schema}.${userModel.tableName} 
        SET ${expiredDateField} = CASE`;

      updatedUsers.forEach(updatedUser => {
        const { phoneNumber, extendedMonth } = updatedUser;
        sqlQuery += ` WHEN ${phoneNumberField} = '${phoneNumber}' 
          THEN (GREATEST(CURRENT_DATE, ${expiredDateField}) 
          + INTERVAL '${extendedMonth} month')`;
      });

      sqlQuery += ` END WHERE ${phoneNumberField} 
        IN (${updatedUsers.map(updatedUser => `'${updatedUser.phoneNumber}'`).join(',')});`;

      //console.log(sqlQuery);

      await userModel.sequelize.query(sqlQuery);
    } catch (error) {
      console.error('updateUserByPhoneNumberAndExtendedMonth failed:', error);
      throw error;
    }
  }
}