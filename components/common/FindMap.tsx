'use client';
import { useState, useEffect } from 'react';
import { searchCoord, searchAddress, currentCoord, currentAddress, isDetailMapState, headerModalState, isFindMapState } from '@/recoil/state';
import { useRecoilState } from 'recoil';
import { MdArrowBackIosNew } from 'react-icons/md';
import { GrUserManager } from 'react-icons/gr'
import { arrowStyle } from './AddressModal';
import { mapIconStyle } from './DetailMap';
import { locationDecoder } from '@/lib/locationDecoder';

const FindMap = () => {
  const [coord, setCoord] = useRecoilState(currentCoord)
  const [searchCo, setSearchCo] = useRecoilState(searchCoord)
  const [headerModal, setHeaderModal] = useRecoilState(headerModalState)
  const [address, setAddress] = useRecoilState(currentAddress)
  const [_, setIsDetail] = useRecoilState(isDetailMapState)
  const [isFindMap, setIsFindMap] = useRecoilState(isFindMapState)

  const [centerCoord, setCenterCoord] = useState(coord)

  useEffect(() => {
    if (!coord) return;
    const { kakao } = window;
    kakao.maps?.load(() => {
      let container = document.getElementById('map');

      let options = {
        center: new kakao.maps.LatLng(coord.lat, coord.lng),
        level: 3,
      };
      const geocoder = new kakao.maps.services.Geocoder();

      let map = new kakao.maps.Map(container, options);

      kakao.maps.event.addListener(map, 'dragend', async function() {
        // 중앙 좌표 얻기
        const center = map.getCenter();
        const currentCoord = {
          lat: center.getLat(),
          lng: center.getLng(),
        };
        
        // 좌표 저장
        setCenterCoord(currentCoord);

        // 좌표를 주소로 변환
        const decodedAddress = await locationDecoder(kakao, geocoder, currentCoord);
        
        // 주소 저장
        setAddress(decodedAddress);
      });
    });
  }, []);

  return (
    <div className={`flex flex-col gap-[10px] fixed bottom-0 left-0 w-full py-[40px] transition-all duration-300 ease-in-out bg-white z-10 rounded-t-3xl overflow-hidden h-full`}>
      <div className='relative h-[50px]'>
        <MdArrowBackIosNew style={arrowStyle} onClick={() => setIsFindMap(false)}/>
        <h2 className="font-black text-center text-[1.2rem]">지도에서 주소찾기</h2>
      </div>
      <div className="w-full h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] relative">
        <GrUserManager style={mapIconStyle}/>
        <div id="map" style={{ width: '100%', height: '100%' }}></div>
      </div>
      <div className='flex flex-col gap-[10px] px-[20px]'>
        <p className='font-[500] text-[1.2rem]'>{address}</p>
        {/* <input type='text' className='p-[10px] border rounded-xl' placeholder='상세주소를 입력하세요 (건물명, 동/호수 등)'/> */}

        <span className='cursor-pointer bg-yopink text-white font-black text-[1.2rem] rounded-xl p-[10px] text-center' onClick={() => {
          setIsDetail(false)
          setIsFindMap(false)
          setHeaderModal(false)
          setSearchCo(centerCoord)
        }}>선택한 위치로 설정</span>
      </div>

    </div>
  )
}

export default FindMap