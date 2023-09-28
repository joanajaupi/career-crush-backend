const { connectDB } = require("../../config/dbConfig");
const User = require("../../models/userModel");
const Employer = require("../../models/employerModel");
const Post = require("../../models/postModel");
const Responses = require("../apiResponses");
const History = require("../../models/historyModel");

module.exports.dislikeUser = async (event, context) => {
  console.log("Lambda function invoked");
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    await connectDB();

    const userId = event.queryStringParameters.id;
    const user = await User.findById(userId);
    console.log("User", user);

    if (!user) {
      console.log("User is not found anywhere");
      return Responses._404({
        status: "error",
        message: "User is not found anywhere",
      });
    }

    const postId = event.pathParameters.id;
    const post = await Post.findById(postId);
    console.log("Post", post);

    if (!post) {
      console.log("Post is not found anywhere");
      return Responses._404({
        status: "error",
        message: "Post is not found anywhere",
      });
    }

    const historyUser = await History.findOne({ user: user._id });
    if (!historyUser) {
      const newEntryInHistory = new History({
        user: user._id,
        dislikedUsers: [userId],
      });
      await newEntryInHistory.save();
      console.log(newEntryInHistory);
    } else {
      const updateHistory = await History.findOneAndUpdate(
        { user: user._id },
        { $push: { dislikedUsers: userId } }
      );
      console.log(updateHistory);
    }

    console.log("User disliked by employer successfully");

    return Responses._200({
      status: "success",
      message: "User disliked successfully",
    });
  } catch (error) {
    console.error("Something went wrong", error);
    return Responses._500({
      status: "error",
      message:
        "An error occurred while disliking the user, check the logs for more information",
    });
  }
};
