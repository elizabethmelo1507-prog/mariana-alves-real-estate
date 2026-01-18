import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

export const openai = new OpenAI({
    apiKey: apiKey || 'dummy-key-for-build',
    dangerouslyAllowBrowser: true
});
