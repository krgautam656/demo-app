/******************************************************************************
 * (c) 2005-2019 Copyright, Real-Time Innovations.  All rights reserved.       *
 * No duplications, whole or partial, manual or electronic, may be made        *
 * without express written permission.  Any such copies, or revisions thereof, *
 * must display this notice unaltered.                                         *
 * This code contains trade secrets of Real-Time Innovations, Inc.             *
 ******************************************************************************/

const sleep = require('sleep')
const path = require('path')
const fs = require('fs')
const rti = require('rticonnextdds-connector')
const configFile = path.join(__dirname, 'UserConfig.xml')

const run = async() => {
    const connector = new rti.Connector('UserParticipantLibrary::UserPubParticipant', configFile)
    const output = connector.getOutput('UserPublisher::UserWriter')
    try {
        console.log('Waiting for subscriptions...')
        await output.waitForSubscriptions()

        console.log('Writing...')

        JSON.parse(fs.readFileSync('./users.json', 'utf8'))
            .forEach(function(user) {
                output.instance.setString('name', (!Object.keys(user.lastName).length) ? user.firstName + ' ' + user.lastName : user.firstName)
                output.instance.setString('email', user.email)
                output.instance.setString('gender', user.gender)
                output.instance.setNumber('phonenumber', user.phoneNumber)
                output.instance.setNumber('dob', user.dob)
                output.write()

                sleep.msleep(500)
            })

        console.log('Exiting...')
            // Wait for all subscriptions to receive the data before exiting
        await output.wait()
    } catch (err) {
        console.log('Error encountered: ' + err)
    }
    connector.close()
}

run()