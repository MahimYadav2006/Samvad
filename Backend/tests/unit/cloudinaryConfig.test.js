jest.mock("cloudinary", () => ({
  v2: {
    config: jest.fn(),
    uploader: {},
  },
}));

const mockCloudinaryStorageFactory = jest.fn((opts) => opts);
jest.mock("multer-storage-cloudinary", () => mockCloudinaryStorageFactory);

const mockMulter = jest.fn(({ storage }) => ({ storage }));
jest.mock("multer", () => mockMulter);

describe("cloudinary storage wiring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  it("passes the Cloudinary module (with v2) to multer-storage-cloudinary", () => {
    const cloudinaryModule = require("cloudinary");
    const {
      uploadAvatar,
      uploadDoc,
      uploadAudio,
      uploadMedia,
      cloudinary,
    } = require("../../utilities/cloudinary");

    expect(cloudinary).toBe(cloudinaryModule.v2);
    expect(mockCloudinaryStorageFactory).toHaveBeenCalled();

    const firstCallOptions = mockCloudinaryStorageFactory.mock.calls[0][0];
    expect(firstCallOptions.cloudinary).toBe(cloudinaryModule);
    expect(firstCallOptions.cloudinary.v2).toBeDefined();

    [uploadAvatar, uploadDoc, uploadAudio, uploadMedia].forEach((uploader) => {
      expect(uploader).toBeDefined();
      expect(uploader.storage).toBeDefined();
    });
  });
});
