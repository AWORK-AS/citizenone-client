export default defineEventHandler(async (event) => {                                                                
      const runtimeConfig = useRuntimeConfig()                                                                        
      const authorization = getHeader(event, 'authorization')                                                         
      const query = getQuery(event)                                                                                   
                                                                                                                      
      const headers: Record<string, string> = {                                                                       
          Accept: 'application/json',                                                                                 
      }                                                                                                               
                                                                                                                      
      if (authorization) {                                                                                            
          headers.Authorization = authorization                                                                       
      }                                                                                                               
                                                                                                                      
      try {                                                                                                           
          const parentId = query?.parent_id || query?.folder_id                                                       
          const search = query?.search                                                                                
                                                                                                                      
          // Build query parameters                                                                                   
          const queryParams: Record<string, any> = {}                                                                 
                                                                                                                      
          if (parentId) {                                                                                             
              queryParams.parent_id = parentId                                                                        
              queryParams.folder_id = parentId                                                                        
          }                                                                                                           
                                                                                                                      
          if (search) {                                                                                               
              queryParams.search = search                                                                             
          }                                                                                                           
                                                                                                                      
          const response = await $fetch('/google-drive/files', {                                                      
              baseURL: runtimeConfig.public.apiBaseURL,                                                               
              method: 'GET',                                                                                          
              headers,                                                                                                
              query: Object.keys(queryParams).length > 0 ? queryParams : undefined,                                   
          })                                                                                                          
          return response                                                                                             
      } catch (error: any) {                                                                                          
          console.error('Error fetching Google Drive files:', error)                                                  
          throw createError({                                                                                         
              statusCode: error.statusCode || 500,                                                                    
              statusMessage: error.message || 'Failed to fetch Google Drive files',                                   
          })                                                                                                          
      }                                                                                                               
  })