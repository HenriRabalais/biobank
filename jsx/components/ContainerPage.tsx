import React, { useState, useCallback, useEffect, useContext, ReactElement }  from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import {
  ISpecimen,
  IContainer,
  useContainer,
  Container,
  ContainerProvider,
  IDimension,
} from '../entities';
import { clone, mapFormOptions } from '../utils';
import {
  useBiobankContext,
  useContainerById,
  useEditable,
  useBarcodePageContext
} from '../hooks';
import { Globals, Header, ContainerDisplay, BarcodePathDisplay, CoordinateLabel } from '../components';
import { ContainerAPI } from '../APIs';
import { BarcodePageProvider } from '../contexts';
import Loader from 'jsx/Loader';
declare const loris: any;

const initCurrent = {                                                           
  list: {},                                                                     
};                                                                              

export type Current = {
  list?: Record<string, any>,
  prevCoordinate?: number,
  coordinate?: number,
  barcode?: string,
  sequential?: boolean,
  containerBarcode?: string
}

export const ContainerPage: React.FC<RouteComponentProps<{barcode: string}>> = ({
  match,
  location,
  history
}) => {

  const [current, setCurrent] = useState<Current>(initCurrent);                          
  const { editable, edit, clear } = useBarcodePageContext();
  const { options, containers } = useBiobankContext();
  const container = useContainer(new Container(containers[match.params.barcode]));

  const drag = useCallback((e) => {                                             
    const cont = JSON.stringify(containers[e.target.id]);             
    e.dataTransfer.setData('text/plain', cont);                            
  }, [containers]);                                                        
                                                                                
  const updateCurrent = (name: string, value: any) =>  {                        
    setCurrent(prevCurr => ({                                                   
      ...prevCurr,                                                              
      [name]: value                                                             
    }));                                                                        
  }                                                                             

  function setCheckoutList(selectedContainer: IContainer): void {                        
    // Clear current container field.                                           
    updateCurrent('containerBarcode', 1)                                             
    updateCurrent('containerBarcode', null);                                         
    const list = clone(current.list);                                           
    list[container.coordinate] = selectedContainer;                                     
    updateCurrent('list', list);                                                
  }                                                                             

  const checkoutButton = () => {                                                
    if (                                                                        
      !loris.userHasPermission('biobank_container_update') ||                   
      containers[container.barcode].children.length == 0               
    ) {                                                                         
      return;                                                                   
    }                                                                           
                                                                                
    return (                                                                    
      <div style={{ marginLeft: 'auto', height: '10%', marginRight: '10%' }}>   
        <div                                                                    
          className={                                                           
            !editable.containerCheckout && !editable.loadContainer              
              ? 'action-button update open'                                     
              : 'action-button update closed'                                   
          }                                                                     
          title='Checkout Child Containers'                                     
          onClick={() => edit('containerCheckout')}                             
        >                                                                       
          <span className='glyphicon glyphicon-share' />                        
        </div>                                                                  
      </div>                                                                    
    );                                                                          
  };                                                                            

  const barcodes = mapFormOptions(containers, 'barcode');                  

  // XXX: KEEP COMMENTED OUT
  // delete values that are parents of the container                            
                                                                                
  //TODO re-instate this in some form!                                          
  //  Object.keys(parents).forEach((key) =>                              
  //    Object.keys(barcodes).forEach(                                          
  //      (i) =>                                                                
  //        parents[key] == barcodes[i] && delete barcodes[i]            
  //    )                                                                       
  //  );                                                                        
  // UP UNTIL HERE


  const containerDisplay = (                                                    
    <div className='display-container'>                                         
      {checkoutButton()}                                                        
      <ContainerDisplay                                                         
        container={container}                                                   
        barcodes={barcodes}                                                     
        current={current}                                                       
        editable={editable}                                                     
        edit={edit}                                                             
        clearAll={clear}                                                     
        updateCurrent={updateCurrent}                                                 
        setCheckoutList={setCheckoutList}                                       
      />                                                                        
      <div style={{ display: 'inline' }}>
        <BarcodePathDisplay container={container.getData()}/>
      </div>             
    </div>                                                                      
  );                                                                            

  const containerList = () => {                                                 
    if (!container.children) {                                         
      return <div className='title'>This Container is Empty!</div>;             
    }                                                                           
                                                                                
    let listAssigned = [];                                                      
    let unassigned = [];                                                      
    let coordinateList = [];                                                    
                                                                                
    // if (!loris.userHasPermission('biobank_specimen_view')) {                  
    //   return; // This is the correct place for the return statement           
    // }                                                                         

    container.children.forEach((child) => {
      if (child.coordinate) {
        listAssigned.push(
          <div key={child.barcode}>
            <Link to={'/barcode='+child.barcode}>
              {child.barcode}
            </Link>
          </div>
        );
      } else {
        unassigned.push(
          <div key={child.barcode}>
            <Link
              to={'/barcode='+child.barcode}
              id={child.barcode}
              draggable={true}
              onDragStart={drag}
            >
              {child.barcode}
            </Link>
            <br />
          </div>
        );
      }

      const coordinateLabel = <CoordinateLabel
      container={containers[child.barcode]}/>;
      coordinateList.push(<div key={child.barcode}>at {coordinateLabel}</div>);
    })
                                                                                
    return (                                                                    
      <div>                                                                     
        <div className='title'>                                                 
          {listAssigned.length !== 0 ? 'Assigned Containers' : null}            
        </div>                                                                  
        <div className='container-coordinate'>                                  
          <div>{listAssigned}</div>                                             
          <div style={{ paddingLeft: 10 }}>{coordinateList}</div>               
        </div>                                                                  
        {listAssigned.length !== 0 ? <br /> : null}                             
        <div className='title'>                                                 
          {unassigned.length !== 0 ? 'Unassigned Containers' : null}        
        </div>                                                                  
        {unassigned}                                                        
      </div>                                                                    
    );                                                                          
  };                                                                            

  return (
    <ContainerProvider container={container}>
      <Link to={`/`}>
        <span className='glyphicon glyphicon-chevron-left'/>
        Return to Filter
      </Link>
      <Header clearAll={clear}/>
      <div className='summary'>
        <Globals clearAll={clear}/>
        <div className='container-display'>                                         
          {containerDisplay}                                                        
          <div className='container-list'>{containerList()}</div>                   
        </div>                                                                      
      </div>
    </ContainerProvider>
  );
}
