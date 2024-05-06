import { FieldConfiguration } from '../types';
import { IContainer, ContainerHook, useContainerContext } from '../entities';
import { mapFormOptions } from '../utils';
import { DynamicField } from '../components';

// TODO: find a way to implement this again:                                    
// const removeChildContainers = (object, id) => {                              
//   delete object[id];                                                         
//   for (let key in containers) {                                              
//     if (id == containers[key].parentContainerBarcode) {                           
//       object = removeChildContainers(object, key);                           
//     }                                                                        
//   }                                                                          
//   return object;                                                             
// };                                                                           
                                                                                
// TODO: find a way to implement this again:                                    
// Delete child containers from options if a container is being placed in a     
// another container.                                                           
// if (container) {                                                             
//   containerBarcodesNonPrimary = removeChildContainers(                       
//     containerBarcodesNonPrimary,                                             
//     container.barcode                                                             
//   );                                                                         
// }                                                                            

type ContainerFields = Pick<IContainer, 'barcode' | 'center' |
  'parentContainer' | 'lotNumber' | 'expirationDate' | 'status' | 'type'>;

const getContainerFieldConfig = (
  container: ContainerHook
) : Record<keyof ContainerFields,FieldConfiguration<IContainer>> => ({
  barcode: {                                                                    
    label: 'Barcode',                                                           
    type: 'text',                                                               
    required: true,                                                             
  },                                                                            
  center: {                                                                     
    label: 'Site',                                                              
    type: 'select',                                                             
    required: true,                                                             
    getOptions: (context) => {                                                  
      return context.options.centers;                                           
    }                                                                           
  },                                                                            
  parentContainer: {                                                          
    label: 'Parent Container Barcode',                                          
    type: 'search',                                                             
    required: false,                                                            
    getOptions: (context) => {                                                  
      return Object.values(context.containers)                                  
      .reduce((result, container: IContainer) => {                               
        const dimension = container.dimension;
        const capacity = dimension.x * dimension.y * dimension.z;            
        const available = capacity - Number(container.childContainers.length);        
        result[container.barcode] = container.barcode +                              
             ' (' +available + ' Available Spots)';                             
        return result;                                                          
      }, {});                                                                   
    }                                                                           
  },                                                                            
  lotNumber: {                                                                  
    label: 'Lot Number',                                                        
    type: 'text',                                                               
    required: false,                                                            
  },                                                                            
  expirationDate: {                                                             
    label: 'Expiration Date',                                                   
    type: 'date',                                                               
    required: false,                                                            
  },                                                                            
  status: {                                                                   
    label: 'Status',                                                            
    type: 'select',                                                             
    required: true,                                                             
    getOptions: (context) => {                                                   
      return mapFormOptions(context.options.container.stati, 'label');
    },                                                                          
  },                                                                            
  type: {                                                                     
    label: 'Container Type',                                                    
    type: 'select',                                                             
    required: true,                                                             
    getOptions: (context) => {                                                  
      return mapFormOptions(context.options.container.typesNonPrimary, 'label');

      // const containerTypesPrimary = mapFormOptions(
      //   options.container.typesPrimary,
      //   'label',
      // );
      // const containerTypes = {};
      // if (type && options.specimen.typeContainerTypes[typeId]) {
      //   Object.keys(containerTypesPrimary).forEach((id) => {
      //     options.specimen.typeContainerTypes[typeId].forEach((i) => {
      //       if (id == i) {
      //         containerTypes[id] = containerTypesPrimary[id];
      //       }
      //     });
      //   });
      // }
      // const containerTypesPrimary = mapFormOptions(
      //   options.container.typesPrimary,
      //   'label',
      // );
     
      // const validContainers = {};
      // if (specimen.typeId && options.specimen.typeContainerTypes[specimen.typeId]) {
      //   Object.keys(containerTypesPrimary).forEach((id) => {
      //     options.specimen.typeContainerTypes[specimen.typeId].forEach((i) => {
      //       if (id == i) {
      //         validContainers[id] = containerTypesPrimary[id];
      //       }
      //     });
      //   });
      // }
    }                                                                           
  }                                                                             
});                                                                              
                                                                                
export const ContainerField: React.FC<{                                         
  property: keyof IContainer,                                                    
}> = ({ property }) => {                                                                         
  const container = useContainerContext();
  const field = getContainerFieldConfig(container)[property];                                 
  return <DynamicField property={property} hook={container} field={field}/>   
}    
