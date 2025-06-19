// It is used beacuse we want to avoid syncronous/asynchronous issues in the code
// It will be used as a wrapper function

const catchAsync = (fn) => {
    return (req,res,next) => {
        fn(req,res,next).catch((err)=> next(err));
    }
};

module.exports = catchAsync;