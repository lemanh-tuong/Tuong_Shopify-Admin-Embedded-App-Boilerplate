import { API_VERSION } from 'server/env';
import { reportService } from 'server/services/FirebaseSentryErrorService';
import axios from 'axios';
import { ShopifyRestError } from '../ShopifyRestError';

interface ShopifyTheme {
  admin_graphql_api_id: string;
  created_at: string;
  id: number;
  name: string;
  previewable: boolean;
  processing: boolean;
  role: string;
  theme_store_id: boolean;
  updated_at: string;
}

interface GetThemesResponseSuccess {
  themes: ShopifyTheme[];
}

interface GetActiveTheme {
  /** domain của shop */
  myshopifyDomain: string;
  /** online token hoặc offline token */
  accessToken: string;
}
export const getActiveTheme = async ({ myshopifyDomain, accessToken }: GetActiveTheme) => {
  try {
    const res = await axios.request<GetThemesResponseSuccess>({
      url: `https://${myshopifyDomain}/admin/api/${API_VERSION}/themes.json`,
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
    });

    const activeTheme = res.data.themes.find(theme => theme.role === 'main');
    return activeTheme;
  } catch (error) {
    const error_ = error as Error;
    reportService.createReportError({
      error: error_,
      positionError: 'getActiveTheme',
      additionalData: JSON.stringify({ myshopifyDomain, accessToken }),
    });
    throw new ShopifyRestError(error_);
  }
};
