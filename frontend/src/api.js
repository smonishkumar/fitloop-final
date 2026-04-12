import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const resolveApiBaseUrl = () => {
  const envBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (envBaseUrl && typeof envBaseUrl === 'string') {
    return envBaseUrl.endsWith('/') ? envBaseUrl : `${envBaseUrl}/`;
  }

  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    const host = window.location.hostname || 'localhost';
    return `${protocol}//${host}:3000/api/`;
  }

  return 'http://localhost:3000/api/';
};

export const fitloopApi = createApi({
  reducerPath: 'fitloopApi',
  baseQuery: fetchBaseQuery({ baseUrl: resolveApiBaseUrl() }),
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({ url: 'auth/register', method: 'POST', body })
    }),
    login: builder.mutation({
      query: (body) => ({ url: 'auth/login', method: 'POST', body })
    }),
    scanPhoto: builder.mutation({
      query: (formData) => ({ url: 'scan/photo', method: 'POST', body: formData })
    }),
    scanLive: builder.mutation({
      query: (formData) => ({ url: 'scan/live', method: 'POST', body: formData })
    }),
    scanCapture: builder.mutation({
      query: (formData) => ({ url: 'scan/capture', method: 'POST', body: formData })
    }),
    getProducts: builder.query({
      query: () => 'products'
    }),
    getFitScore: builder.mutation({
      query: (body) => ({ url: 'fit/score', method: 'POST', body }) // body: { measurements, productSizeChart }
    }),
    getGeneralSize: builder.mutation({
      query: (body) => ({ url: 'fit/general-size', method: 'POST', body }) // body: { measurements }
    }),
    getSizeChart: builder.query({
      query: () => 'fit/size-chart'
    }),
    getOccasionRecommendation: builder.mutation({
      query: (body) => ({ url: 'recommend/occasion', method: 'POST', body }) // body: { occasion, measurements }
    })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useScanPhotoMutation,
  useScanLiveMutation,
  useScanCaptureMutation,
  useGetProductsQuery,
  useGetFitScoreMutation,
  useGetGeneralSizeMutation,
  useGetSizeChartQuery,
  useGetOccasionRecommendationMutation
} = fitloopApi;

