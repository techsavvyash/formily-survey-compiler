

const sendTextQuestion = () => {
    const msg = JSON.parse($0);
    msg.payload.text = "Please enter your name";
    return JSON.stringify(msg);
};

const saveReplyAndSendQuestion = () => {
    const msg = JSON.parse($0);
    msg.payload.text = "Please enter your name";
    return JSON.stringify(msg);
}

const sendChoices = () => {
    const msg = JSON.parse($0);

    // store user's reply

    msg.transformer.metaData.formInput["Father's name"] = msg.payload.text;

    // ask next question
    msg.payload.text = "Class in which the student is studying right now";


    // this is a selection question, so we need to send options
    msg.payload.buttonChoices = {
        header: "Class in which the student is studying right now",
        choices: [
            {   
                key: "Class-1-key",
                text: "Class-1",
                isEnabled: true
            },
            {
                key: "Class-2-key",
                text: "Class-2",
                isEnabled: true
            },
        ]
    }

    return JSON.stringify(msg);
}