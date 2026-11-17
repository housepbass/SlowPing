"""Author finite static challenges; independently derive maxima using Python graph search.
Not used by the game or JavaScript evaluator. Run from the SlowPing repository root.
"""
import json
import heapq
from pathlib import Path

B = '198.51.100.1/32'
A = '192.0.2.1/32'
old = json.loads(Path('data/levels.json').read_text())[0]
old.update(difficulty='FOUNDATION', briefing='Start with one editable route. Send the request over slower links while its reply keeps the working direct route. Run a baseline ping, inspect R1, then compare the two directions.', viewHeight=400, expectedRequest=['A','R1','R2','R3','B'], expectedReply=['B','R3','R1','A'])
levels = [old]

def build(ident,title,subtitle,n,coords,edges,end,expert=False):
    last=f'R{n}'
    nodes=[dict(id='A',label='Source A',kind='endpoint',address='192.0.2.1',x=55,y=250)]
    nodes += [dict(id=f'R{i}',label=f'Router {i}',kind='router',x=coords[i-1][0],y=coords[i-1][1]) for i in range(1,n+1)]
    nodes += [dict(id='B',label='Destination B',kind='endpoint',address='198.51.100.1',x=945,y=250)]
    links=[dict(a='A',b='R1',delayMs=end),dict(a=last,b='B',delayMs=end)]
    for a,b,delay,*drawing in edges:
        e=dict(a=f'R{a}',b=f'R{b}',delayMs=delay)
        if drawing:e.update(drawing[0])
        links.append(e)
    def neighbors(id):
        return [(e['b'] if e['a']==id else e['a'],e['delayMs']) for e in links if id in (e['a'],e['b'])]
    def first_hop(source,dest):
        queue=[(0,source,[])]
        visited=set()
        while queue:
            cost,node,path=heapq.heappop(queue)
            if node==dest:return (path+[node])[1]
            if node in visited:continue
            visited.add(node)
            for other,d in neighbors(node):
                if other not in visited:heapq.heappush(queue,(cost+d,other,path+[node]))
        raise ValueError('Disconnected author graph')
    routes={};edits=[]
    for i in range(1,n+1):
        id=f'R{i}';prefixes=['198.51.100.0/24','192.0.2.0/24'] if expert else [B,A]
        routes[id]=[dict(prefix=p,nextHop=first_hop(id,dest)) for p,dest in zip(prefixes,['B','A'])]
        for index in [0,1]:
            if (i==1 and index==1) or (i==n and index==0):continue
            r=routes[id][index]
            options=[node for node,_ in neighbors(id) if node.startswith('R')]
            if expert and id=='R3' and index==1:
                options=['R7','R4']
                r['note']='Return-path restriction: R3 may send traffic toward A only via R7 or R4.'
            assert r['nextHop'] in options
            edits.append(dict(router=id,index=index,prefixes=[r['prefix'],'203.0.113.0/24'],nextHops=[r['nextHop']]+[x for x in options if x!=r['nextHop']]+[None]))
    if expert:
        for router,prefix,hop in [('R1',B,last),(last,A,'R1')]:
            routes[router].append(dict(prefix=prefix,nextHop=hop,note='Host-route override: this /32 beats the broader /24 above. Set it to Unconfigured to let the /24 choose the next hop.'))
            edits.append(dict(router=router,index=2,prefixes=[prefix,'203.0.113.0/24'],nextHops=[hop,None]))
    level=dict(id=ident,title=title,subtitle=subtitle,protocol='static-ipv4',nodes=nodes,links=links,routes=routes,edits=edits,solution=[],baselineRtt=2*(2*end+next(d for a,b,d,*_ in edges if a==1 and b==n)),targetRtt=1,hints=[],difficulty='EXPERT' if expert else 'ADVANCED',viewHeight=530)
    def choices(id,index):
        slot=next((s for s in edits if s['router']==id and s['index']==index),None)
        return slot['nextHops'] if slot else [routes[id][index]['nextHop']]
    # For these authored tables, more-specific overrides can be disabled; broad
    # choices therefore define the maximum set of eligible next hops per leg.
    def enumerate_paths(start,finish,index,max_routers):
        result=[]
        def walk(node,path,cost):
            if node==finish:
                result.append((cost+2*end,path));return
            if len(path)>=max_routers:return
            for other,delay in neighbors(node):
                if other.startswith('R') and other not in path and other in choices(node,index):
                    walk(other,path+[other],cost+delay)
        walk(start,[start],0)
        return result
    req=enumerate_paths('R1',last,0,7);rep=enumerate_paths(last,'R1',1,7)
    request=max(req,key=lambda x:x[0]);reply=max(rep,key=lambda x:x[0]);level['targetRtt']=request[0]+reply[0]
    level['expectedRequest']=['A']+request[1]+['B'];level['expectedReply']=['B']+reply[1]+['A']
    assignments={(s['router'],s['index']):dict(router=s['router'],index=s['index'],prefix=routes[s['router']][s['index']]['prefix'],nextHop=routes[s['router']][s['index']]['nextHop']) for s in edits}
    for index,(_,path) in enumerate([request,reply]):
        for a,b in zip(path,path[1:]):
            if (a,index) in assignments:assignments[a,index]['nextHop']=b
    if expert:
        assignments[('R1',2)]['nextHop']=None;assignments[(last,2)]['nextHop']=None
    level['solution']=list(assignments.values())
    if expert:
        level['briefing']='Eight routers, but TTL 8 allows at most seven forwarding routers per leg. A /32 host route beats a /24 network route: disable the two host overrides to expose your detours. R3 has different permitted return choices. Optimize the request and reply independently.'
        level['hints']=['First inspect the /32 overrides on R1 and R8: changing their /24 routes alone leaves ping on the short path. Then find high-delay simple paths using at most seven routers per leg. R3 has a restricted route toward A.',f'Disable the /32 overrides on R1 and R8. Request: {" → ".join(request[1])} ({request[0]} ms). Reply: {" → ".join(reply[1])} ({reply[0]} ms). Use Show solution to apply these coordinated routes, then ping.']
    else:
        level['briefing']='Ten editable routes across a six-router mesh. Both ping directions can detour, and the slowest path is not the one with the largest first link. Trace the complete request and reply; a single wrong next hop can create a loop.'
        level['hints']=['Work backward from the destination to avoid loops, then trace the reply separately. Compare whole-path sums: the 40 ms cross-network leg is valuable, while the 5 ms diagonal is a shortcut.',f'Request: {" → ".join(request[1])} ({request[0]} ms). Reply: {" → ".join(reply[1])} ({reply[0]} ms). Every visited router needs the right route in that direction.']
    report=dict(id=ident,routers=n,editableRoutes=len(edits),baseline=level['baselineRtt'],target=level['targetRtt'],request=request,reply=reply,validRequestPaths=len(req),validReplyPaths=len(rep),unboundedRequest=max(enumerate_paths('R1',last,0,n),key=lambda x:x[0]),unboundedReply=max(enumerate_paths(last,'R1',1,n),key=lambda x:x[0]))
    return level,report

l2,p2=build('crossed-wires','Crossed wires','Coordinate both directions across a weighted mesh.',6,[(175,250),(365,90),(655,90),(365,395),(655,395),(825,250)],[(1,6,7,dict(labelY=235)),(1,2,20),(2,3,12),(3,6,25),(1,4,8),(4,5,40),(5,6,18),(2,4,15),(3,5,10),(2,5,5,dict(labelX=565,labelY=300))],2)
l3,p3=build('hostile-takeover','Hostile takeover','Outsmart specific routes. Stay inside the hop budget.',8,[(190,250),(320,85),(510,85),(710,85),(320,405),(510,405),(710,405),(810,250)],[(1,8,5,dict(labelX=510,labelY=245)),(1,2,18),(2,3,24),(3,4,42),(4,8,15),(1,5,35),(5,6,12),(6,7,48),(7,8,28),(2,5,9,dict(labelX=305,labelY=245)),(3,6,33,dict(labelX=495,labelY=320)),(4,7,11,dict(labelX=725,labelY=245)),(2,6,17,dict(labelX=379,labelY=185)),(3,7,8,dict(labelX=572.5,labelY=185)),(6,8,6,dict(labelX=685,labelY=345))],3,True)
levels.extend([l2,l3])
Path('data/levels.json').write_text(json.dumps(levels,indent=2)+'\n')
Path('specs/003-static-difficulty/path-proof.json').write_text(json.dumps([p2,p3],indent=2)+'\n')
print(json.dumps([p2,p3],indent=2))
