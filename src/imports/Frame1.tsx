function Frame1() {
  return (
    <div className="basis-0 content-stretch flex grow items-center justify-center min-h-px min-w-px relative shrink-0">
      <p className="basis-0 font-['Inter:Regular',sans-serif] font-normal grow leading-[normal] min-h-px min-w-px not-italic relative shrink-0 text-[12px] text-black">Texto</p>
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex gap-[22px] items-start relative shrink-0 w-full">
      {[...Array(2).keys()].map((_, i) => (
        <Frame1 key={i} />
      ))}
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white content-stretch flex flex-col gap-[22px] items-start px-[49px] py-[51px] relative size-full">
      <p className="font-['Inter:Bold',sans-serif] font-bold leading-[normal] not-italic relative shrink-0 text-[12px] text-black w-full">Titulo</p>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[normal] not-italic relative shrink-0 text-[12px] text-black w-full">Texto</p>
      <Frame2 />
    </div>
  );
}