"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, '..', '.env') });
exports.config = {
    githubConfig: {
        githubBranch: process.env.GITHUB_BRANCH || 'develop',
        githubOwner: process.env.GITHUB_OWNER || 'NewEraCode-Holdings',
        githubRepo: process.env.GITHUB_REPO || 'kh-cdk-components',
    },
    nodeConfig: {
        configProd: process.env.NPM_CONFIG_PRODUCTION || 'false',
        logLevel: process.env.NPM_CONFIG_LOGLEVEL || 'error',
        nodeEnv: process.env.NODE_ENV || 'development',
        yarnProd: process.env.YARN_PRODUCTION || 'false',
    },
    secretParams: {
        npmToken: process.env.NPM_TOKEN,
    },
    secretsManager: {
        githubToken: process.env.GITHUB_TOKEN,
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsaUNBQWlDO0FBQ2pDLDZCQUE4QjtBQUM5QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFzQi9DLFFBQUEsTUFBTSxHQUFZO0lBQzdCLFlBQVksRUFBRTtRQUNaLFlBQVksRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQWEsSUFBSSxTQUFTO1FBQ3BELFdBQVcsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxxQkFBcUI7UUFDOUQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxJQUFJLG1CQUFtQjtLQUMzRDtJQUNELFVBQVUsRUFBRTtRQUNWLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLHFCQUFxQixJQUFJLE9BQU87UUFDeEQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLElBQUksT0FBTztRQUNwRCxPQUFPLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksYUFBYTtRQUM5QyxRQUFRLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxlQUFlLElBQUksT0FBTztLQUNqRDtJQUNELFlBQVksRUFBRTtRQUNaLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQW1CO0tBQzFDO0lBQ0QsY0FBYyxFQUFFO1FBQ2QsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBc0I7S0FDaEQ7Q0FDRixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZG90ZW52IGZyb20gJ2RvdGVudic7XG5pbXBvcnQgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmRvdGVudi5jb25maWcoeyBwYXRoOiBwYXRoLmpvaW4oX19kaXJuYW1lLCAnLi4nLCAnLmVudicpIH0pO1xuXG5leHBvcnQgaW50ZXJmYWNlIElDb25maWcge1xuICBnaXRodWJDb25maWc6IHtcbiAgICBnaXRodWJCcmFuY2g6IHN0cmluZztcbiAgICBnaXRodWJPd25lcjogc3RyaW5nO1xuICAgIGdpdGh1YlJlcG86IHN0cmluZztcbiAgfSxcbiAgbm9kZUNvbmZpZzoge1xuICAgIGNvbmZpZ1Byb2Q6IHN0cmluZztcbiAgICBsb2dMZXZlbDogc3RyaW5nO1xuICAgIG5vZGVFbnY6IHN0cmluZztcbiAgICB5YXJuUHJvZDogc3RyaW5nO1xuICB9LFxuICBzZWNyZXRQYXJhbXM6IHtcbiAgICBucG1Ub2tlbjogc3RyaW5nO1xuICB9LFxuICBzZWNyZXRzTWFuYWdlcjoge1xuICAgIGdpdGh1YlRva2VuOiBzdHJpbmc7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNvbmZpZzogSUNvbmZpZyA9IHtcbiAgZ2l0aHViQ29uZmlnOiB7XG4gICAgZ2l0aHViQnJhbmNoOiBwcm9jZXNzLmVudi5HSVRIVUJfQlJBTkNIIHx8ICdkZXZlbG9wJyxcbiAgICBnaXRodWJPd25lcjogcHJvY2Vzcy5lbnYuR0lUSFVCX09XTkVSIHx8ICdLaW5kSGVhbHRoLUhvbGRpbmdzJyxcbiAgICBnaXRodWJSZXBvOiBwcm9jZXNzLmVudi5HSVRIVUJfUkVQTyB8fCAna2gtY2RrLWNvbXBvbmVudHMnLFxuICB9LFxuICBub2RlQ29uZmlnOiB7XG4gICAgY29uZmlnUHJvZDogcHJvY2Vzcy5lbnYuTlBNX0NPTkZJR19QUk9EVUNUSU9OIHx8ICdmYWxzZScsXG4gICAgbG9nTGV2ZWw6IHByb2Nlc3MuZW52Lk5QTV9DT05GSUdfTE9HTEVWRUwgfHwgJ2Vycm9yJyxcbiAgICBub2RlRW52OiBwcm9jZXNzLmVudi5OT0RFX0VOViB8fCAnZGV2ZWxvcG1lbnQnLFxuICAgIHlhcm5Qcm9kOiBwcm9jZXNzLmVudi5ZQVJOX1BST0RVQ1RJT04gfHwgJ2ZhbHNlJyxcbiAgfSxcbiAgc2VjcmV0UGFyYW1zOiB7XG4gICAgbnBtVG9rZW46IHByb2Nlc3MuZW52Lk5QTV9UT0tFTiBhcyBzdHJpbmcsXG4gIH0sXG4gIHNlY3JldHNNYW5hZ2VyOiB7XG4gICAgZ2l0aHViVG9rZW46IHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTiBhcyBzdHJpbmcsXG4gIH1cbn07XG4iXX0=