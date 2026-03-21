import { surpriseMePrompts } from "../constants";
import FileSaver from "file-saver";
import { getImageExtensionFromSource } from "./imageFiles";

const getRandomPrompt = (prompt) => {
    const randomIdx = Math.floor(Math.random() * surpriseMePrompts.length);
    const randomPrompt = surpriseMePrompts[randomIdx];
    if (prompt === randomPrompt) {
        return getRandomPrompt(prompt);
    }

    return randomPrompt;
}

const downloadImage = async(_id, photo) => {
    const extension = getImageExtensionFromSource(photo);
    FileSaver.saveAs(photo, `download-${_id}-vinciforge-soumya.${extension}`);
}

export { getRandomPrompt, downloadImage };
