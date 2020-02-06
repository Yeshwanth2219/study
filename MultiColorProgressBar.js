import React from "react";
import "./Multicolor.css";
import moment from "moment";

export class MultiColorProgressBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            progressBarDetails: [
                {
                    name: 'pre-task',
                    progressLevel: 0,
                    color: '#eb4d4b',
                    time: ""
                },
                {
                    name: 'patch-task',
                    progressLevel: 100,
                    color: '#6ab04c',
                    time: ""
                },
                {
                    name: 'post-task',
                    progressLevel: 0,
                    color: 'orange',
                    time: ""
                }
            ],
            progressBarValues: {
                patchTaskProgress: 0,
                preTaskProgress: 0,
                postTaskProgress: 0
            },
            progressBar: false
        }
    }

    componentDidMount() {
        localStorage.clear();
        // this.setState({
        //     progressBarValues: {
        //         ...this.state.progressBarValues,
        //         patchTaskProgress: this.props.endTime || 100
        //     }
        // })
    }

    static getDerivedStateFromProps(props, state) {
        const { endTime, readings } = props;
        const { progressBarValues } = state;
        if (endTime !== progressBarValues.patchTaskProgress) {
            return {
                progressBarValues: {
                    ...progressBarValues,
                    patchTaskProgress: props.endTime
                }
            };
        }
        if (readings.value && readings.type === "pre-task") {
            return {
                progressBarValues: {
                    ...progressBarValues,
                    preTaskProgress: readings.operation === "add" ? progressBarValues.preTaskProgress + readings.value : (readings.type === "pre-task" && readings.operation === "subtract") ? progressBarValues.preTaskProgress - readings.value : progressBarValues.preTaskProgress,
                }
            }
        }

        if (readings.value && readings.type === "post-task") {
            return {
                progressBarValues: {
                    ...progressBarValues,
                    postTaskProgress: readings.operation === "add" ? progressBarValues.postTaskProgress + readings.value : readings.operation === "subtract" ? progressBarValues.postTaskProgress - readings.value : progressBarValues.postTaskProgress,
                }
            }
        }
        // Return null if the state hasn't changed
        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        const progressData = this.getTaskPortion(this.props);
        console.log(progressData, "finalproportion");
        const { readings } = this.props;
        if (this.state.showBar) {
            this.setState({
                progressBarDetails: progressData,
                showBar: false
            })
        }
    }

    getProgressPercentage(typeOfProgress) {
        const { patchTaskProgress, preTaskProgress, postTaskProgress } = this.state.progressBarValues;
        let calculatedProgressValue = (typeOfProgress / (patchTaskProgress + preTaskProgress + postTaskProgress)) * 100;
        return calculatedProgressValue;
    }

    getTaskPortion(progressValue) {
        console.log("state", this.state.progressBarValues);
        const { readings, patchStartTime, endTime } = progressValue;
        const { patchTaskProgress, preTaskProgress, postTaskProgress } = this.state.progressBarValues;
        const modifiedTime = moment(patchStartTime).format("hh:mm A");
        const patchEndTime = moment(patchStartTime).add(endTime, "minutes").format("hh:mm A");
        localStorage.setItem("taskInitialStartTime", modifiedTime);
        localStorage.setItem("taskInitialEndTime", patchEndTime);
        let updatedProgress = this.state.progressBarDetails.map((progressitems, index) => {
            var updatedStartPatchTask = moment(patchStartTime).format("hh:mm A");
            var updatedEndPatchTask = moment(patchStartTime).add(endTime, "minutes").format("hh:mm A");
            var prePostUpdatedEndTime = moment(patchStartTime).add(endTime, "minutes").format("hh:mm A");
            localStorage.setItem("patchTaskStartTime", updatedStartPatchTask);
            localStorage.setItem("patchTaskEndTime", updatedEndPatchTask)
            if (progressitems.name === "patch-task") {
                const localSavedStartTime = localStorage.getItem("patchTaskStartTime") ? localStorage.getItem("patchTaskStartTime") : updatedStartPatchTask;
                const localSavedEndTime = localStorage.getItem("patchTaskEndTime") ? localStorage.getItem("patchTaskEndTime") : updatedEndPatchTask;
                if (readings.type === "pre-task" && readings.operation === "add") {
                    console.log("pre-add");
                    if (localSavedStartTime && localSavedEndTime) {
                        updatedStartPatchTask = moment(localStorage.getItem("updatedPreEndTime"), "hh:mm A").format("hh:mm A");
                        updatedEndPatchTask = moment(localSavedEndTime, "hh:mm A").add(endTime, "minutes").format("hh:mm A");
                        progressitems.time = `${updatedStartPatchTask}-${updatedEndPatchTask}`;
                        progressitems.progressLevel = this.getProgressPercentage(patchTaskProgress);
                    }
                } else if (readings.type === "pre-task" && readings.operation === "subtract") {
                    console.log("pre-sub")
                    updatedStartPatchTask = moment(localSavedStartTime, "hh:mm A").subtract(readings.value, "minutes").format("hh:mm A");
                    updatedEndPatchTask = moment(localSavedEndTime, "hh:mm A").subtract(endTime, "minutes").format("hh:mm A");
                    progressitems.time = `${updatedStartPatchTask}-${updatedEndPatchTask}`;
                    progressitems.progressLevel = progressitems.progressLevel + readings.value;
                } else if (readings.type === "post-task" && readings.operation === "add") {
                    console.log("add-ppost")
                    //  updatedStartPatchTask = moment(updatedStartPatchTask, "hh:mm A").add(readings.value, "minutes").format("hh:mm A");
                    //updatedEndPatchTask = moment(updatedStartPatchTask, "hh:mm A").add(endTime, "minutes").format("hh:mm A");
                    progressitems.time = `${updatedStartPatchTask}-${updatedEndPatchTask}`;

                } else if (readings.type === "post-task" && readings.operation === "subtract") {
                    console.log("sub-post");
                    updatedStartPatchTask = moment(localSavedStartTime, "hh:mm A").subtract(readings.value, "minutes").format("hh:mm A");
                    updatedEndPatchTask = moment(localSavedEndTime, "hh:mm A").subtract(endTime, "minutes").format("hh:mm A");
                    progressitems.time = `${updatedStartPatchTask}-${updatedEndPatchTask}`;
                    progressitems.progressLevel = progressitems.progressLevel + readings.value;
                } else {
                    progressitems.time = `${modifiedTime}-${patchEndTime}`;
                }
                localStorage.setItem("patchTaskStartTime", updatedStartPatchTask);
                localStorage.setItem("patchTaskEndTime", updatedEndPatchTask)
            } else if ((progressitems.name === "pre-task" && readings.type === "pre-task") || (progressitems.name === "post-task" && readings.type === "post-task")) {
                if (readings.operation === "add" && readings.type === "pre-task") {
                    let prePostStartTime = localStorage.getItem("taskInitialStartTime");
                    if (progressitems.progressLevel === 0) {
                        prePostUpdatedEndTime = moment(prePostStartTime, "hh:mm A").add(readings.value, "minutes").format("hh:mm A");
                        localStorage.setItem("updatedPreEndTime", prePostUpdatedEndTime);
                        progressitems.time = `${prePostStartTime}-${prePostUpdatedEndTime}`;
                    } else if (progressitems.progressLevel > 0) {
                        prePostUpdatedEndTime = moment(localStorage.getItem("updatedPreEndTime"), "hh:mm A").add(readings.value, "minutes").format("hh:mm A");
                        progressitems.time = `${prePostStartTime}-${prePostUpdatedEndTime}`;
                        localStorage.setItem("updatedPreEndTime", prePostUpdatedEndTime);
                    }
                    progressitems.progressLevel = this.getProgressPercentage(preTaskProgress);

                } else if (readings.operation === "subtract" && readings.type === "pre-task") {
                    let prePostStartTime = localStorage.getItem("taskInitialStartTime");
                    if (progressitems.progressLevel === 0) {
                        prePostUpdatedEndTime = moment(prePostStartTime, "hh:mm A").add(readings.value, "minutes").format("hh:mm A");
                        localStorage.setItem("updatedPostEndTime", prePostUpdatedEndTime);
                        progressitems.time = `${prePostStartTime}-${prePostUpdatedEndTime}`;
                    } else if (progressitems.progressLevel > 0) {
                        prePostUpdatedEndTime = moment(localStorage.getItem("updatedPostEndTime"), "hh:mm A").add(readings.value, "minutes").format("hh:mm A");
                        progressitems.time = `${prePostStartTime}-${prePostUpdatedEndTime}`;
                        localStorage.setItem("updatedPostEndTime", prePostUpdatedEndTime);
                    }
                    progressitems.progressLevel = this.getProgressPercentage(preTaskProgress);;
                } else if (readings.operation === "add" && readings.type === "post-task") {
                    let prePostStartTime = localStorage.getItem("patchTaskEndTime");
                    if (progressitems.progressLevel === 0) {
                        prePostUpdatedEndTime = moment(prePostStartTime, "hh:mm A").add(readings.value, "minutes").format("hh:mm A");
                        localStorage.setItem("updatedPostEndTime", prePostUpdatedEndTime);
                        progressitems.time = `${prePostStartTime}-${prePostUpdatedEndTime}`;
                    } else if (progressitems.progressLevel > 0) {
                        prePostUpdatedEndTime = moment(localStorage.getItem("updatedPostEndTime"), "hh:mm A").add(readings.value, "minutes").format("hh:mm A");
                        progressitems.time = `${prePostStartTime}-${prePostUpdatedEndTime}`;
                        localStorage.setItem("updatedPostEndTime", prePostUpdatedEndTime);
                    }
                    progressitems.progressLevel = this.getProgressPercentage(postTaskProgress);
                } else if (readings.operation === "subtract" && readings.type === "post-task") {
                    let prePostEndTime = localStorage.getItem("updatedPostEndTime");
                    const reducedPostTask = moment(prePostEndTime, "hh:mm A").subtract(readings.value, "minutes").format("hh:mm A");
                    progressitems.time = `${prePostEndTime}-${reducedPostTask}`;
                    progressitems.progressLevel = this.getProgressPercentage(postTaskProgress);
                    localStorage.setItem("updatedPostEndTime", reducedPostTask)
                }
            }
            return progressitems;
        });
        if (!this.state.progressBar) {
            this.setState({
                progressBar: true
            })
        }
        return updatedProgress;
    }

    /**
     * Method to render the progress bar 
     */
    renderProgressBar() {
        const progressBar = this.state.progressBarDetails || [];

        let bars = progressBar.length && progressBar.map((item, i) => {
            if (item.progressLevel > 0) {
                return (
                    <div className="bar" style={{ 'backgroundColor': item.color, 'width': item.progressLevel + '%' }} key={i}>
                        <span>{item.time}</span>
                    </div>
                )
            }
        });
        return bars;
    }

    render() {
        return (
            <div className="multicolor-bar">
                <div className="bars">
                    {this.renderProgressBar()}
                </div>
            </div>
        );
    }
}

