import { surpriseMePrompts } from "../constants";
import FileSaver from "file-saver";

const getRandomPrompt = (propmt) => {
    const randomIdx = Math.floor(Math.random() * surpriseMePrompts.length);
    const randomPrompt = surpriseMePrompts[randomIdx];
    if (propmt === randomPrompt) {
        return getRandomPrompt(propmt);
    }

    return randomPrompt;
}

const downloadImage = async(_id, photo) => {
    FileSaver.saveAs(photo, `download-${_id}-ai_painter_soumya.jpg`);
}

export { getRandomPrompt, downloadImage };