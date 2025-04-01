import { 
  FacilityInfo,
} from '../types';

/**
 * Get facility info response model for tsoa documentation
 */
export interface GetFacilityInfoResponseModel extends FacilityInfo {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Facility info retrieved successfully" 
   */
  message: string;
}

/**
 * Upgrade facility request model
 */
export interface UpgradeFacilityRequestModel {
  /** 
   * Type of facility to upgrade
   * @example "training" 
   */
  facility_type: 'training' | 'scout' | 'stadium';
}

/**
 * Upgrade facility response model
 */
export interface UpgradeFacilityResponseModel extends UpgradeFacilityResponse {
  /** 
   * Success status
   * @example true 
   */
  success: boolean;
  
  /** 
   * Response message
   * @example "Facility upgraded successfully" 
   */
  message: string;
}

export interface UpgradeFacilityResponse {
  /** 
   * Updated team information
   */
  team: {
    /** 
     * Team ID
     * @example "550e8400-e29b-41d4-a716-446655440000" 
     */
    id: string;
    
    /** 
     * Team name
     * @example "Dodgeball Dynamos" 
     */
    name: string;
    
    /** 
     * Team budget
     * @example 1000 
     */
    budget: number;
    
    /** 
     * Training facility level (optional)
     * @example 2 
     */
    training_facility_level?: number;
    
    /** 
     * Scout level (optional)
     * @example 2 
     */
    scout_level?: number;
  };
  
  /** 
   * Upgrade cost
   * @example 500 
   */
  cost: number;
}
