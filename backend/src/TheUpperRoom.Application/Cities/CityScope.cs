// traces_to: L2-079
using TheUpperRoom.Domain.Cities;

namespace TheUpperRoom.Application.Cities;

public static class CityScope
{
    public static IEnumerable<T> ForCity<T>(IEnumerable<T> source, string cityId)
        where T : IHasCity =>
        source.Where(item => item.CityId == cityId);

    public static T? VisibleOrNull<T>(T? entity, string cityId)
        where T : class, IHasCity =>
        entity is null ? null : (entity.CityId == cityId ? entity : null);
}
