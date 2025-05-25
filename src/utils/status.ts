export function judgeStatus(status) {
  switch (status) {
    case 'UN_SUBMIT':
      return '未提交';
    case 'ON_CHECK':
      return '待审核';
    case 'PASS':
      return '已认证';
    case 'REJECT':
      return '驳回';
    case 'WAIT_PAY':
      return '待支付';
    case 'WAIT_BEGAN':
      return '待开始';
    case 'COLLABORATING':
      return '合作中';
    case 'CHECKING':
      return '审核中';
    case 'FINISH':
      return '已结束';
    case 'CANCEL':
      return '已取消';
    case 'COMPLETE':
      return '已完成';
    case 'BIDDING':
      return '投标中';
  }
}
