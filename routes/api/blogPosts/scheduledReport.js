const config = require('config')
const { SendHtmlEmail } = require("../emails/sendEmail")

const twilioSID = process.env.TWILIO_ACCOUNT_SID || config.get('TWILIO_ACCOUNT_SID')
const twilioToken = process.env.TWILIO_AUTH_TOKEN || config.get('TWILIO_AUTH_TOKEN')
const client = require('twilio')(twilioSID, twilioToken)

// BlogPostView Model
const BlogPostView = require('../../../models/blogPosts/BlogPostView')
const User = require('../../../models/User')

const from = 'whatsapp:+14155238886'; // Twilio WhatsApp Sandbox number
// ARRAY OF NUMBERS TO SEND THE REPORT TO (WHATSAPP)
const numbers = ['whatsapp:+250786791577', 'whatsapp:+250738140795']

// GET DAILY REPORT
const getDailyReport = async () => {

    let report

    try {
        // ADD 2 HOURS TO GET THE CORRECT DATE IN CAT
        const today = new Date(new Date().getTime())

        // Get today's date in ISO format with his time set to 00:00:00
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())

        // MAKE SHORT REPORT, COUNT ALL VIEWS, COUNTRIES AND DEVICES, GROUP BY COUNTRY AND DEVICE, SORT BY COUNTRY AND DEVICE, GROUP BY BLGPOST AND SORT BY BLOGPOST
        await BlogPostView.aggregate([
            {
                $match: { createdAt: { $gte: todayDate } }
            },
            {
                $group: {
                    _id: { blogPost: '$blogPost', country: '$country', device: '$device' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.country': 1, '_id.device': 1 }
            },
            {
                $group: {
                    _id: '$_id.blogPost',
                    countries: {
                        $push: {
                            country: '$_id.country',
                            device: '$_id.device',
                            count: '$count'
                        }
                    },
                    count: { $sum: '$count' }
                }
            },
            {
                $sort: { '_id': 1 }
            },
            {
                $lookup: {
                    from: 'blogposts',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'blogPost'
                }
            },
            {
                // Unwind to get an object instead of an array
                $unwind: "$blogPost"
            },
            {
                $project: {
                    _id: 0,
                    blogPost: '$blogPost.title',
                    countries: 1,
                    count: 1
                }
            }
        ], function (err, result) {
            if (err) {
                res.status(400).json({ msg: err.message })
            } else {

                // TOTAL VIEWS COUNT
                let totalViewsCount = 0
                result.forEach((blogPost) => {
                    totalViewsCount += blogPost.count
                })

                // UNIQUE COUNTRIES AND ITS COUNT
                const uniqueCountries = []
                const uniqueCountriesCount = []
                result.forEach((blogPost) => {
                    blogPost.countries.forEach((country) => {
                        if (!uniqueCountries.includes(country.country)) {
                            uniqueCountries.push(country.country)
                            uniqueCountriesCount.push({ country: country.country, count: country.count })
                        } else {
                            uniqueCountriesCount.forEach((uniqueCountry) => {
                                if (uniqueCountry.country === country.country) {
                                    uniqueCountry.count += country.count
                                }
                            })
                        }
                    })
                })

                // UNIQUE DEVICES AND ITS COUNT
                const uniqueDevices = []
                const uniqueDevicesCount = []
                result.forEach((blogPost) => {
                    blogPost.countries.forEach((country) => {
                        if (!uniqueDevices.includes(country.device)) {
                            uniqueDevices.push(country.device)
                            uniqueDevicesCount.push({ device: country.device, count: country.count })
                        } else {
                            uniqueDevicesCount.forEach((uniqueDevice) => {
                                if (uniqueDevice.device === country.device) {
                                    uniqueDevice.count += country.count
                                }
                            })
                        }
                    })
                })

                // EACH BLOG POST WITH ITS VIEW COUNT
                const blogPostsViews = []
                result.forEach((blogPost) => {
                    blogPostsViews.push({ blogPost: blogPost.blogPost, count: blogPost.count })
                })

                // TOTAL VIEWS COUNT
                const totalViews = { totalViewsCount: totalViewsCount, uniqueCountriesCount: uniqueCountriesCount, uniqueDevicesCount: uniqueDevicesCount, blogPostsViews: blogPostsViews }

                // SEND THE REPORT
                report = totalViews
            }
        })

    } catch (err) {
        console.error(err.message)
        report = null
    }

    return report
}


const scheduledReportMessage = async () => {

    const report = await getDailyReport()
    const admins = await User.find({ role: { $in: ["Admin", "SuperAdmin"] } }).select("email")

    const date = new Date();
    const currentDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const scheduleDate = `${currentDate}, 11:59:59 PM`;

    // BUILD THE REPORT MESSAGE
    let reportMessage = `*TODAY, ${currentDate} REPORT FOR BLOG POSTS VIEWS* \n\n`
    reportMessage += `*Total Views:* ${report && report.totalViewsCount} \n\n`
    reportMessage += `*Unique Countries:* \n`
    report.uniqueCountriesCount.forEach((country) => {
        reportMessage += `${country.country}: ${country.count} \n`
    })
    reportMessage += `\n`
    reportMessage += `*Unique Devices:* \n`
    report.uniqueDevicesCount.forEach((device) => {
        reportMessage += `${device.device}: ${device.count} \n`
    })
    reportMessage += `\n`
    reportMessage += `*Blog Posts Views:* \n`
    report.blogPostsViews.forEach((blogPost) => {
        reportMessage += `${blogPost.blogPost}: ${blogPost.count} \n`
    })

    // BUILD THE REPORT MESSAGE FOR EMAIL
    let reportMessageEmail = {
        subject: `TODAY, ${currentDate} REPORT BLOG POSTS VIEWS`,
        html: `
            <h3 style="color: blue"><u>Report for ${currentDate}</u></h3>
            <h4><u>Total Views:</u> ${report.totalViewsCount}</h4>
            <h4><u>Unique Countries:</u></h4>
            <ul>
                ${report.uniqueCountriesCount.map((country) => `<li>${country.country}: ${country.count}</li>`).join('')}
            </ul>
            <h4><u>Unique Devices:</u></h4>
            <ul>
                ${report.uniqueDevicesCount.map((device) => `<li>${device.device}: ${device.count}</li>`).join('')}
            </ul>
            <h4><u>Blog Posts Views:</u></h4>
            <ul>
                ${report.blogPostsViews.map((blogPost) => `<li>${blogPost.blogPost}: ${blogPost.count}</li>`).join('')}
            </ul>
        `
    }

    // SCHEDULE THE MESSAGE
    // console.log(`Scheduling message for ${scheduleDate} from ${date}`);
    const interval = setInterval(() => {
        const now = new Date();

        // console.log(now.toLocaleString() + ' Checking if scheduled time has been reached...' + scheduleDate.toLocaleString());

        if (now.toLocaleString() === scheduleDate) {
            console.log('Sending report...');

            // SEND THE MESSAGE TO THE ARRAY OF NUMBERS
            numbers.forEach((to) => {
                client.messages
                    .create({
                        from: from,
                        to: to,
                        body: reportMessage
                    })
                    .then((message) => console.log(message.sid))
                    .catch((error) => console.error(error))
                    .finally(() => clearInterval(interval));
            })

            // Sending e-mail to super admins and admins
            admins.forEach(adm => {
                SendHtmlEmail(adm.email, reportMessageEmail.subject, reportMessageEmail.html)
            })
        }
    }, 1000); // Check every second if the scheduled time has been reached
};

module.exports = scheduledReportMessage