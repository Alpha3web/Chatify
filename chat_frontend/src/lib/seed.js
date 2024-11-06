import Compression  from "compression-js";
import util from "util";

const compressAsync = util.promisify(Compression.compress);

const compressFile = async file => {
    const compressedBuffer = await compressAsync(file.buffer, {
        level: -1,
    });
    const compressedFile = new File([compressedBuffer], file.originalname, {
        type: file.type,
    });

    return compressedFile;
}

export default compressFile;